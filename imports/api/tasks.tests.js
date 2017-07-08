import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Tasks } from './tasks.js';

if (Meteor.isServer) {
    describe('Tasks', () => {
        describe('methods', () => {
            const userId = Random.id();
            let taskId;
            let currentUser;

            beforeEach(() => {
                resetDatabase();
                Tasks.remove({});

                Factory.define('user', Meteor.users, {
                    createdAt: () => new Date(),
                    username: 'tmeasday',
                });

                currentUser = Factory.create('user');
                sinon.stub(Meteor, 'user');
                Meteor.user.returns(currentUser);


                taskId = Tasks.insert({
                    text: 'test task',
                    createdAt: new Date(),
                    owner: userId,
                    username: 'tmeasday 2',
                });

                taskId2 = Tasks.insert({
                    text: 'test task 2',
                    createdAt: new Date(),
                    owner: Random.id(),
                    username: 'tmeasday 3',
                });

            });

            afterEach(() => {
                Meteor.user.restore();
                resetDatabase();
            });

            it('can delete owned task', () => {
                // Find the internal implementation of the task method so we can
                // test it in isolation
                const deleteTask = Meteor.server.method_handlers['tasks.remove'];

                // Set up a fake method invocation that looks like what the method expects
                const invocation = {userId};

                // Run the method with `this` set to the fake invocation
                deleteTask.apply(invocation, [taskId]);

                // Verify that the method does what we expected
                assert.equal(Tasks.find().count(), 1);
            });

            //REWRITE to include method
            it('can add tasks', () => {

                const insertTask = Meteor.server.method_handlers['tasks.insert'];
                let postCount = Tasks.find().count();

                let taskInput = {
                    text: 'test task!',
                    date: '2017-04-17',
                    priority: 4,
                    dueDate: 20170417,
                };

                const invocation = {userId};

                insertTask.apply(invocation, [taskInput.text, taskInput.date, taskInput.priority, taskInput.dueDate]);

                const test = Tasks.findOne({text: 'test task!'});

                assert.strictEqual(Tasks.find().count(), postCount + 1);
            });

            it('can toggle checkbox', () => {
                const toggleCheckedTask = Meteor.server.method_handlers['tasks.setChecked'];
                const id_ = Random.id();
                let checked = true;

                CheckedTaskId = Tasks.insert({
                    text: 'test task!',
                    createdAt: new Date(),
                    owner: id_,
                    username: 'tmeasdaqqyjsdks',
                    private: false
                });


                let testingUserInput = Tasks.findOne(CheckedTaskId);
                toggleCheckedTask.apply(testingUserInput, [CheckedTaskId, checked]);

                testingUserInput = Tasks.findOne(CheckedTaskId);
                let testingFakeUser = Tasks.findOne({owner: userId});

                assert.equal(testingUserInput.checked, true, 'add checked field value to Task');
                assert.equal(testingFakeUser.checked, undefined, 'throw Error when checked field value is not assigned to Task');

                toggleCheckedTask.apply(testingUserInput, [CheckedTaskId, !checked]);
                testingUserInput = Tasks.findOne(CheckedTaskId);

                assert.equal(testingUserInput.checked, false, 'toggle checked field value in Task');


            });
        });
    });
}