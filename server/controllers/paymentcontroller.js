const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = {
    payment: (req, res, next) => {
        const amountArray = req.body.amount.toString().split('');
        const pennies = [];
        const { user, address, city, state, zipCode, total, email, phone } = req.body;
        const date = new Date();
        const db = req.app.get('db');
        for (var i = 0; i < amountArray.length; i++) {
            if (amountArray[i] === ".") {
                if (typeof amountArray[i + 1] === "string") {
                    pennies.push(amountArray[i + 1]);
                } else {
                    pennies.push("0");
                }
                if (typeof amountArray[i + 2] === "string") {
                    pennies.push(amountArray[i + 2]);
                } else {
                    pennies.push("0");
                }
                break;
            } else {
                pennies.push(amountArray[i])
            }
        }
        const convertedAmt = parseInt(pennies.join(''));

        const charge = stripe.charges.create({
            amount: convertedAmt, // amount in cents, again
            currency: 'usd',
            source: req.body.token.id,
            description: 'Test charge from react app'
        }, function (err, charge) {
            if (err) return res.sendStatus(500)
            db.createInvoice([user, date, address, city, state, zipCode, total, email, phone]).then((invoice) => {
                res.status(200);
            })
            return res.sendStatus(200);
        });
    }
}