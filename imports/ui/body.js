import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../api/tasks.js';
 
import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});
 
Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
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
    var priority = target.priority.value;
    var date = target.date.value;
    var date_interger = date.replace(/-/g, '');

    priority = Number(priority);
    date_interger = Number(date_interger);
 
    // Insert a task into the collection if task is longer than 4 characters.
    if(text.length <= 5) {
		alert('task names must be at least 5 characters long.');
 	}
 	else if(date.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/g)) {
 		alert('invalid date.');
 	}
 	else {
 		Meteor.call('tasks.insert', text, date, priority, date_interger);
 		// Clear form
    	target.task.value = '';
    	target.date.value = '';
    	target.priority.value = '1';
    	target.status.value = '1';
 	}
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
  'click .prioritySort'(event) {
  	event.preventDefault();
  	Meteor.call('tasks.prioritySort');
  },
  'click .dateSort'(event) {
  	event.preventDefault();
  	Meteor.call('tasks.dateSort');
  },
   'click .taskSort'(event) {
   	event.preventDefault();
  	Meteor.call('tasks.taskSort');
  }
});