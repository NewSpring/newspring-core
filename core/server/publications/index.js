
import { Sections, Likes } from "../../lib/collections"

/*global Meteor*/
Meteor.publish("sections", () => {
  return Sections.find()
})

// must use function because arrow version doesn't like 'this'
Meteor.publish("likes", function() {
  return Likes.find(
    {
      userId: this.userId
    },
    {
      sort: {
        dateLiked: -1
      }
    }
  )
})
