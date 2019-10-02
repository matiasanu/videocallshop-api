const OpenTok = require('opentok');
var opentok = new OpenTok(
    process.env.TOKBOX_API_KEY,
    process.env.TOKBOX_API_SECRET
);

const createSession = () => {
    return new Promise((resolve, reject) => {
        // Generate tokbox session id
        opentok.createSession(
            { mediaMode: 'routed' },
            async (error, session) => {
                if (error) {
                    reject('Error creating session.');
                } else {
                    resolve(session);
                }
            }
        );
    });
};

const generateToken = sessionId => {
    return opentok.generateToken(sessionId);
};

module.exports = {
    createSession,
    generateToken,
};
