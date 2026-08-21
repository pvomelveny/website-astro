#import "/_lib/wanshi.typ": *

#show: wanshi

#metadata((
  "title": "Notes Home",
  "collect": "true",
))

= Research
Here are the broad areas I'm thinking about.
Feel free to explore. The organization may be a little chaotic.

// Lists every research area hub: any note carrying `"area": "true"` in its
// metadata. Marking a new hub with that key is all it takes to appear here, so
// there is no list to keep in step. See boolean/index.typ for the pattern.
#query(from: "children", key: "area", value: "true")


= Thoughts
Not math, but general thoughts. Possibly tangentially related to math.

= Recent Notes
If you'd like to just get an idea of what I've been thinking about recently, check out whatever I've written recently.

#recent(count: 10)

If you want to keep up to date, consider subscribing to my RSS feed.

= About

#embed("/about", "About", open: false)

