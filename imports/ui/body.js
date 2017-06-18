import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../api/tasks.js';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
 
import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});
 
Template.body.helpers({
  tasks() {
    let instance = Template.instance();

    if (instance.state.get('hideCompleted')) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
    }
    if (Session.equals('sortMethod', 'sortByCreatedAt')) {
        return Tasks.find({}, {sort: {createdAt: -1}});
    }
    if (Session.equals('sortMethod','sortByPriority')) {
        return Tasks.find({}, { sort: { priority: -1 }});
    }
    if (Session.equals('sortMethod','sortByDate')) {
        return Tasks.find({}, { sort: { dueDate: 1 }});
    }
    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  }
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.task.value;
    const date = target.date.value;
    let priority = target.priority.value;
    let dueDate = date.replace(/-/g, '');

    priority = Number(priority);
    dueDate = Number(dueDate);
 
    // Insert a task into the collection if task is longer than 4 characters.
    if(text.length < 5) {
      alert('Task names must be at least 5 characters long.');
    }
    else if(!date.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g)) {
      alert('Please enter valid date.');
    }
    else {
      Meteor.call('tasks.insert', text, date, priority, dueDate);
      // Clear form
      target.task.value = '';
      target.date.value = '';
      target.priority.value = '1';
      target.status.value = '1';
    }
  },
  'change .hide-completed input'(event, instance) {;
      instance.state.set('hideCompleted', event.target.checked);
  },
  'click .prioritySort'() {
      Session.set('sortMethod', 'sortByPriority');
  },
  'click .dateSort'() {
      Session.set('sortMethod', 'sortByDate');
  },
   'click .taskSort'() {
      Session.set('sortMethod', 'sortByCreatedAt');
  }
});