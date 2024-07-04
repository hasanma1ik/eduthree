const cron = require('node-cron');
const moment = require('moment-timezone');
const Notification = require('./models/notificationmodel'); // Ensure path is correct
const ClassSchedule = require('./models/ClassScheduleModel'); // Ensure path is correct

const isRunning = new Set();

async function sendClassStartNotification(io, userId, message, classScheduleId) {
  if (isRunning.has(classScheduleId)) {
    console.log(`Already processing ${classScheduleId}. Skipping.`);
    return;
  }

  isRunning.add(classScheduleId);
  try {
    // Creating a notification document in MongoDB with type 'classReminder'
    const notification = await Notification.create({
      user: userId,
      message,
      classSchedule: classScheduleId,
      type: 'classReminder', // Specify the type of the notification
      read: false
    });

    console.log(`Notification created and sent for schedule ${classScheduleId} to user ${userId}`);
    // Emitting with detailed information including type
    io.emit('notification-channel', { 
      userId, 
      message, 
      notificationId: notification._id,
      type: 'classReminder'  // This type should be handled specifically on the client-side
    });
  } catch (error) {
    console.error('Error creating/sending notification:', error);
  } finally {
    isRunning.delete(classScheduleId);
  }
}

function resetNotificationSentFlags(ClassSchedule) {
  // This task resets the notificationSent flag for all ClassSchedule documents daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Resetting notificationSent flags...');
    await ClassSchedule.updateMany({}, { $set: { notificationSent: false } });
    console.log('notificationSent flags reset.');
  });
}

function startScheduledTasks(io) {
  // This task checks for classes starting in the next 15 minutes and sends notifications
  cron.schedule('* * * * *', async () => {
    console.log('Checking for classes starting in the next 15 minutes...');
    const now = moment.utc();
    const fifteenMinutesLater = now.clone().add(15, 'minutes');
    const dayOfWeek = now.format('dddd');

    const upcomingClasses = await ClassSchedule.find({
      dayOfWeek: dayOfWeek,
      notificationSent: false, // Only select classes that haven't had notifications sent
    }).populate('users');

    upcomingClasses.forEach(async (schedule) => {
      const classStartTimeMoment = moment.utc(schedule.startTime, 'HH:mm');
      if (now.isBefore(classStartTimeMoment) && fifteenMinutesLater.isSameOrAfter(classStartTimeMoment)) {
        const message = `Reminder: Your ${schedule.subject} class starts in 15 minutes.`;
        schedule.users.forEach(async (user) => {
          await sendClassStartNotification(io, user._id, message, schedule._id);
        });

        // Mark the notification as sent for this class schedule
        await ClassSchedule.findByIdAndUpdate(schedule._id, { $set: { notificationSent: true } });
      }
    });
  });

  resetNotificationSentFlags(ClassSchedule);
}

module.exports = startScheduledTasks;



