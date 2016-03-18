/////
// routes
////

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to: 'navbar'
  });
  this.render('website_list', {
    to: 'main'
  });
});

Router.route('website/:_id', function () {
  this.render('navbar', {
    to: 'navbar'
  });
  this.render('website_item', {
    to: 'main',
    data: function () {
      return Websites.findOne({_id: this.params._id});
    }
  });
  this.render('comment_list', {
    to: 'secondary'
  });
})

/////
// accounts config
////

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

/////
// template helpers
/////

// helper function that returns all available websites
Template.website_list.helpers({
  websites:function(){
    return Websites.find({}, {sort: {rating:-1}});
  }
});

Template.website_item.helpers({
  date:function(full_date){
    return full_date.toLocaleDateString("en-US");
  }
});

Template.comment_list.helpers({
  comments:function(){
    return Comments.find({});
  }
});

Template.comment_item.helpers({
  commentAuthor:function(user_id){
    return Meteor.users.findOne({_id: user_id}).username;
  },
  commentBelongsToPost:function(post_id){
    return (Router.current().params._id === post_id)
  },
  commentBelongsToAuthor:function(user_id){
    if (Meteor.userId() === user_id) {
      return true;
    } else {
      return false;
    }
  }
});

/////
// template events
/////

Template.website_item.events({
  "click .js-upvote":function(event){
    var website_id = this._id;
    Websites.update({_id: website_id }, { $inc: {rating: + 1 }});
    return false;
  },
  "click .js-downvote":function(event){
    var website_id = this._id;
    Websites.update({_id: website_id }, { $inc: {negRating: + 1 }});
    console.log("Down voting website with id "+website_id);
    return false;
  }
})

Template.website_form.events({
  "click .js-toggle-website-form":function(event){
    $("#website_form").toggle('slow');
    $("#add_site_button").html(function(i, html){
      return html.indexOf('plus') !== -1
      ? '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Cancel'
      : '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a website';
    })
  },
  "submit .js-save-website-form":function(event){
    var url = event.target.url.value;
    var title = event.target.title.value;
    var description = event.target.description.value;
    console.log("The url they entered is: "+url);

    if (Meteor.user()) {
      Websites.insert({
        url: url,
        title: title,
        description: description,
        createdOn: new Date(),
        addedBy: Meteor.user()._id
      });
    }

    $("#website_form").toggle('slow');
    $("#add_site_button").html('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a website');

    return false;

  }
});

Template.comment_form.events({
  "click .js-toggle-comment-form":function(event){
    $("#comment_form").toggle('slow');
    $("#add_comment_button").html(function(i, html){
      return html.indexOf('plus') !== -1
      ? '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Cancel'
      : '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a comment';
    });
  },
  "submit .js-save-comment-form":function(event){
    var comment = event.target.comment.value;
    console.log("The comment they entered is: "+comment);

    if (Meteor.user()) {
      Comments.insert({
        comment: comment,
        post_id: Router.current().params._id,
        createdOn: new Date(),
        addedBy: Meteor.user()._id
      });
    }

    $("#comment_form").toggle('slow');
    $("#add_comment_button").html('<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add a comment');

    return false;

  }
});

Template.comment_item.events({
  "click .js-remove-comment":function(event){
    var comment_id = this._id;
    $("#"+comment_id).hide('slow', function () {
      Comments.remove({_id: comment_id});
    })
  }
});
