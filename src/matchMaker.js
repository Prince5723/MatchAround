class Matchmaker {
    constructor(queueManager, chatManager) {
        this.queueManager = queueManager;
        this.chatManager = chatManager;
    }

    async matchUsers() {
        console.log("Matchmaker initialized");
        const malequeueLength = await this.queueManager.getQueueLength('maleQueue');
        const femaleQueueLenght = await this.queueManager.getQueueLength('femaleQueue');
        console.log(malequeueLength, femaleQueueLenght);

        if (malequeueLength === 0 || femaleQueueLenght === 0) {
            console.log("One of the either queue is empty");
            return;
        }
        const maleId = await this.queueManager.popFromQueue('maleQueue');
        const femaleId = await this.queueManager.popFromQueue('femaleQueue');

        const malequeueLengthAfter = await this.queueManager.getQueueLength('maleQueue');
        const femaleQueueLenghtAfter = await this.queueManager.getQueueLength('femaleQueue');

        console.log(malequeueLengthAfter, femaleQueueLenghtAfter);

        if (maleId && femaleId) {
            console.log("Creating room between " + maleId + " and " + femaleId);
            this.chatManager.createRoom(maleId, femaleId);
        }
    }
}

module.exports = { Matchmaker };
