#!/usr/bin/env bash
#
# One-time migration: create the CloudFront URL-rewrite function, deploy the
# wanshi build, and associate the function — in an order that keeps the live
# site working throughout.
#
# Run this with an ADMIN identity. The regular deploy user (Website_Writer) has
# S3 write + cloudfront:CreateInvalidation only, and cannot create functions or
# update the distribution.
#
#     AWS_PROFILE=admin ./infra/setup-cloudfront-function.sh
#
# After this has run once, ordinary deploys are just:
#
#     npm run build
#     aws s3 sync dist/ s3://pvomelveny.com --delete --exclude "*.DS_Store"
#     aws cloudfront create-invalidation --distribution-id E1HKVL3MS04OWG --paths '/*'
#
# ── Why the steps are in this order ──────────────────────────────────────────
#
# The function assumes wanshi's layout, where a note is a flat file
# (notes/welcome.html). The currently-deployed MDX build publishes notes as
# directories (notes/welcome/index.html). Those are mutually exclusive: whichever
# of the two changes first, /notes/welcome breaks until the other catches up —
# and a distribution update takes several minutes to propagate.
#
# So the upload is split in two. The first sync omits --delete, leaving BOTH
# layouts in the bucket at once. While the function rolls out, an edge that has
# it resolves /notes/welcome -> welcome.html, and an edge that does not falls
# back to S3's own index-document handling on the old directory. Both work. Only
# once the function is fully deployed does the second sync remove the stale
# files.
#
# Safe to re-run: the function is updated rather than recreated, and associating
# it twice is a no-op.

set -euo pipefail

DIST_ID="E1HKVL3MS04OWG"
BUCKET="pvomelveny.com"
FN_NAME="pvomelveny-url-rewrite"
FN_SOURCE="infra/cloudfront-url-rewrite.js"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

confirm() {
  local reply
  read -r -p "$(printf '\033[1;33m?? %s [y/N] \033[0m' "$1")" reply
  [[ "$reply" == "y" || "$reply" == "Y" ]] || die "Aborted."
}

# ── 0. Preflight ─────────────────────────────────────────────────────────────

step "Preflight"

for tool in aws jq npm typst wanshi; do
  command -v "$tool" >/dev/null || die "$tool is not on PATH."
done
[[ -f "$FN_SOURCE" ]] || die "$FN_SOURCE not found."

CALLER="$(aws sts get-caller-identity --query Arn --output text)" \
  || die "No usable AWS credentials."
echo "  identity : $CALLER"
echo "  bucket   : s3://$BUCKET"
echo "  dist     : $DIST_ID"

# Fail early and clearly if this identity cannot do the privileged parts,
# rather than halfway through with the site mid-migration.
aws cloudfront get-distribution-config --id "$DIST_ID" >/dev/null \
  || die "Cannot read distribution $DIST_ID."

# Note: read-only probes like `list-functions` are NOT a useful permission
# check here — the deploy user can list functions but cannot create them. The
# only reliable check is to attempt the privileged call, which is why creating
# the function is step 1: if this identity is wrong, the script stops before it
# has built, uploaded, or changed anything.

# ── 1. Create or update the function ─────────────────────────────────────────

step "1/7  Creating the CloudFront function"

if aws cloudfront describe-function --name "$FN_NAME" >/dev/null 2>&1; then
  echo "  exists — updating"
  ETAG="$(aws cloudfront describe-function --name "$FN_NAME" --query ETag --output text)"
  DEV_ETAG="$(aws cloudfront update-function \
    --name "$FN_NAME" \
    --function-config '{"Comment":"Resolve directory and extensionless URLs","Runtime":"cloudfront-js-2.0"}' \
    --function-code "fileb://$FN_SOURCE" \
    --if-match "$ETAG" \
    --query ETag --output text)"
else
  echo "  creating"
  DEV_ETAG="$(aws cloudfront create-function \
    --name "$FN_NAME" \
    --function-config '{"Comment":"Resolve directory and extensionless URLs","Runtime":"cloudfront-js-2.0"}' \
    --function-code "fileb://$FN_SOURCE" \
    --query ETag --output text)"
fi
echo "  DEVELOPMENT stage etag: $DEV_ETAG"

# ── 2. Test it before publishing ─────────────────────────────────────────────

step "2/7  Testing the function against real URLs"

test_uri() {
  local uri="$1" want="$2" got
  cat > "$WORK/event.json" <<JSON
{"version":"1.0","context":{"eventType":"viewer-request"},
 "viewer":{"ip":"1.2.3.4"},
 "request":{"method":"GET","uri":"$uri","headers":{},"querystring":{},"cookies":{}}}
JSON
  got="$(aws cloudfront test-function \
    --name "$FN_NAME" --stage DEVELOPMENT --if-match "$DEV_ETAG" \
    --event-object "fileb://$WORK/event.json" \
    --query 'TestResult.FunctionOutput' --output text | jq -r '.request.uri')"

  if [[ "$got" == "$want" ]]; then
    printf '  ok    %-28s -> %s\n' "$uri" "$got"
  else
    printf '  FAIL  %-28s -> %s (expected %s)\n' "$uri" "$got" "$want"
    return 1
  fi
}

FAILED=0
test_uri "/"                    "/index.html"              || FAILED=1
test_uri "/about"               "/about/index.html"        || FAILED=1
test_uri "/notes/"              "/notes/index.html"        || FAILED=1
test_uri "/notes/welcome"       "/notes/welcome.html"      || FAILED=1
test_uri "/notes/welcome.html"  "/notes/welcome.html"      || FAILED=1
test_uri "/cv.pdf"              "/cv.pdf"                  || FAILED=1
[[ $FAILED -eq 0 ]] || die "Function tests failed — nothing has been published or deployed."

# ── 3. Publish ───────────────────────────────────────────────────────────────

step "3/7  Publishing the function (LIVE stage, still not attached)"
aws cloudfront publish-function --name "$FN_NAME" --if-match "$DEV_ETAG" >/dev/null
FN_ARN="$(aws cloudfront describe-function --name "$FN_NAME" --stage LIVE \
  --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)"
echo "  $FN_ARN"

# ── 4. Build ─────────────────────────────────────────────────────────────────
#
# After the privileged calls, so a wrong identity costs nothing. A published but
# unassociated function has no effect on the live site, so stopping here is safe.

step "4/7  Building the site"
npm run build
[[ -f dist/notes/welcome.html ]] || die "Build did not produce dist/notes/welcome.html."
[[ -f dist/404.html ]]           || die "Build did not produce dist/404.html."
echo "  dist/ built, notes present"

# ── 5. Upload WITHOUT --delete ───────────────────────────────────────────────

step "5/7  Uploading the new build, keeping the old files"
bold "This adds the wanshi notes without removing the MDX ones, so the site"
bold "keeps working from either layout while the function rolls out."
confirm "Sync dist/ to s3://$BUCKET (no deletions)?"

aws s3 sync dist/ "s3://$BUCKET" --no-progress
echo "  uploaded"

# ── 6. Associate the function ────────────────────────────────────────────────

step "6/7  Attaching the function to the default cache behavior"

aws cloudfront get-distribution-config --id "$DIST_ID" > "$WORK/dist.json"
CFG_ETAG="$(jq -r '.ETag' "$WORK/dist.json")"

EXISTING="$(jq -r '.DistributionConfig.DefaultCacheBehavior.FunctionAssociations.Quantity' "$WORK/dist.json")"
if [[ "$EXISTING" != "0" ]]; then
  warn "The default behavior already has $EXISTING function association(s):"
  jq -r '.DistributionConfig.DefaultCacheBehavior.FunctionAssociations.Items[]
         | "     " + .EventType + "  " + .FunctionARN' "$WORK/dist.json"
  confirm "Replace them with $FN_NAME?"
fi

jq --arg arn "$FN_ARN" '
  .DistributionConfig
  | .DefaultCacheBehavior.FunctionAssociations = {
      Quantity: 1,
      Items: [{ FunctionARN: $arn, EventType: "viewer-request" }]
    }
' "$WORK/dist.json" > "$WORK/dist-config.json"

aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --if-match "$CFG_ETAG" \
  --distribution-config "file://$WORK/dist-config.json" >/dev/null
echo "  associated — waiting for the distribution to deploy (usually 3-8 min)"

aws cloudfront wait distribution-deployed --id "$DIST_ID"
echo "  deployed to all edges"

# ── 7. Remove the stale MDX files, then invalidate ───────────────────────────

step "7/7  Removing files the new build no longer contains"
bold "Now that every edge resolves the new layout, the old directory-shaped"
bold "notes can go. This is the only destructive step."
echo
echo "  Would delete:"
aws s3 sync dist/ "s3://$BUCKET" --delete --dryrun --no-progress \
  | grep '^(dryrun) delete:' | sed 's/^/    /' || echo "    (nothing)"
echo
confirm "Delete these?"

aws s3 sync dist/ "s3://$BUCKET" --delete --no-progress
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*' \
  --query 'Invalidation.Id' --output text | sed 's/^/  invalidation: /'

# ── Verify ───────────────────────────────────────────────────────────────────

step "Verifying live URLs"
echo "  (an invalidation takes a minute or two to finish; re-run if these lag)"
sleep 20
for u in / /about /research /teaching /notes/ /notes/welcome /rss.xml /nonexistent-page; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "https://pvomelveny.com$u")"
  case "$u:$code" in
    /nonexistent-page:404) mark="ok  " ;;
    *:200)                 mark="ok  " ;;
    *)                     mark="FAIL" ;;
  esac
  printf '  %s  %-22s %s\n' "$mark" "$u" "$code"
done

step "Done"
echo "If anything above says FAIL, the rollback is:"
echo "  aws cloudfront get-distribution-config --id $DIST_ID > d.json"
echo "  # set DefaultCacheBehavior.FunctionAssociations to {\"Quantity\":0}"
echo "  aws cloudfront update-distribution --id $DIST_ID --if-match <etag> \\"
echo "      --distribution-config file://<edited>"
echo "  git checkout v1.0.0 && npm run build && aws s3 sync dist/ s3://$BUCKET --delete"
