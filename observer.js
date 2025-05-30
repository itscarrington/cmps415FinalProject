class Observer {
  constructor(db) {
    this.db = db;
  }

  async subscribe(username, topic) {
    const users = this.db.collection("Users");
    const board = this.db.collection("Message_board");

    await board.updateOne(
      { name: topic },
      { $addToSet: { subscribers: username } },
      { upsert: true }
    );

    await users.updateOne(
      { username: username },
      { $addToSet: { subscribedTopics: topic } }
    );
  }

  async unsubscribe(username, topic) {
    const users = this.db.collection('Users');
    const board = this.db.collection("Message_board");

    await users.updateOne(
      { username },
      { $pull: { subscribedTopics: topic } }
    );
  
    await board.updateOne(
      { name: topic },
      { $pull: { subscribers: username } }
    );
  }

  async notify(event, data, senderUsername) {
    const users = this.db.collection('Users');
    const notif = this.db.collection('Notifications');
    const subscribers = await users.find({subscribedTopics: event}).toArray();

    for (const user of subscribers) {
      if (user.username === senderUsername) {
        continue;
      }
      await notif.insertOne( {
        username: user.username,
        senderUsername: senderUsername,
        event: event,
        data: data,
        createdAt: new Date()
      });

      console.log(`Notifying user ${user.username} about event: ${event}`)
    }
  }

}
module.exports = Observer;
