let express = require("express");
let path = require('path');
let graphqlHTTP = require("express-graphql");
let { buildSchema } = require("graphql");
let cors = require("cors");
//let Pusher = require("pusher");
let Pusher = require("pusher");
let bodyParser = require("body-parser");
let Multipart = require("connect-multiparty");

//let Multipart = require("connect-multiparty");

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
  type User {
    id : String!
    nickname : String!
    avatar : String!
  }
  type Post {
      id: String!
      user: User!
      caption : String!
      image : String!
  }
  type Query{
    user(id: String) : User!
    post(user_id: String, post_id: String) : Post!
    posts(user_id: String) : [Post]
  }
`);

// Maps id to User object
let userslist = {
  a: {
    id: "a",
    nickname: "Mark",
    avatar: "https://avatars0.githubusercontent.com/u/12327208?s=460&v=4"
  },
  b: {
    id: "b",
    nickname: "OG",
    avatar:
      "http://res.cloudinary.com/og-tech/image/upload/q_40/v1506850315/contact_tzltnn.jpg"
  }
};

let postslist = {
  a: {
    a: {
      id: "a",
      user: userslist["a"],
      caption: "Nairobi at Night",
      image: "https://www.standardmedia.co.ke/images/thursday/ngbuvirkbyz9tm5b46dc9f2b8b3.jpg"
    },
    b: {
      id: "b",
      user: userslist["a"],
      caption: "Oh Mt.Zion",
      image:
        "https://www.standardmedia.co.ke/images/friday/thumb_lqto7hyjun9hezsfkn5aa2e281a314f.jpg"
    },
    c: {
      id: "c",
      user: userslist["a"],
      caption: "Wildlife",
      image:
        "https://i0.wp.com/laikipia.org/wp-content/uploads/2015/01/Mt-Kenya.jpg"
    }
  }
};

// The root provides a resolver function for each API endpoint
let root = {
  user: function({ id }) {
    return userslist[id];
  },
  post: function({ user_id, post_id }) {
    return postslist[user_id][post_id];
  },
  posts: function({ user_id }) {
    return Object.values(postslist[user_id]);
  }
};

// Configure Pusher client
let pusher = new Pusher({
  appId: "546647",
  key: "58a73227ab27a1a98328",
  secret: "62d68b3dc5b74868a932",
  cluster: "ap2",
  encrypted: true
});

// create express app
let app = express();
app.use(cors());
app.use(bodyParser.json());

let multipartMiddleware = new Multipart();


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);



// trigger add a new post
app.post('/newpost', multipartMiddleware, (req,res) => {
  // create a sample post
  let post = {
    user : {
      nickname : req.body.name,
      avatar : req.body.avatar
    },
    image : req.body.image,
    caption : req.body.caption
  }

  // trigger pusher event
  pusher.trigger("posts-channel", "new-post", {
    post
  });

  return res.json({status : "Post created"});
});


app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");
