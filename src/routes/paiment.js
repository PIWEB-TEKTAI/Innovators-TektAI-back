const express = require('express');
const router = express.Router();
const { PremiumPack, FreemiumPack } = require('../models/Pack');
const stripe = require('stripe')('sk_test_51PCMzNHTb56tjMDuNrp9F3jH17WLauGU85sVYMNm3fsRKOG2qqf07MsE1wFffiwhQCCHhmLhsvHSPwIADcqcCGXM001mzvGFVK');

router.get('/pack-price/:packId', async (req, res) => {
  try {
      const packId = req.params.packId;
      const pack = await PremiumPack.findById(packId); // Supposons que vous récupériez le pack premium ici

      if (!pack) {
          return res.status(404).json({ message: 'Pack not found' });
      }

      res.json({ price: pack.price }); // Renvoyer le prix du pack
  } catch (error) {
      console.error('Error fetching pack price:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/packs', async (req, res) => {
    try {
      // Récupérer les packs Premium et Freemium depuis la base de données
      const premiumPack = await PremiumPack.findOne();
      const freemiumPack = await FreemiumPack.findOne();
  
      // Vérifier si les packs existent
      if (!premiumPack || !freemiumPack) {
        return res.status(404).json({ message: 'Packs not found' });
      }
  
      // Retourner les packs
      res.json({ premium: premiumPack, freemium: freemiumPack });
    } catch (error) {
      console.error('Error fetching packs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
router.post('/create-subscription', async (req, res) => {
    const { paymentMethodId, planId, email } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ plan: planId }],
            expand: ['latest_invoice.payment_intent'],
        });

        res.json(subscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send({ error: 'Subscription failed.' });
    }
});



// Créer un paiement par intention pour le pack Premium
router.post('/premium/payment-intent', async (req, res) => {
  try {
    const { packId } = req.body;
    const premiumPack = await PremiumPack.findById(packId);

    if (!premiumPack) {
      return res.status(404).json({ message: 'Premium pack not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: premiumPack.price * 100, // Le montant doit être en cents
      currency: 'eur', // Changez en votre devise préférée si nécessaire
      metadata: {
        packId: premiumPack._id.toString(),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/freemium/payment-intent', async (req, res) => {
    try {
      const { packId } = req.body;
      const freemiumPack = await FreemiumPack.findById(packId);
  
      if (!freemiumPack) {
        return res.status(404).json({ message: 'Freemium pack not found' });
      }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: freemiumPack.price * 100, // Le montant doit être en cents
        currency: 'eur', // Changez en votre devise préférée si nécessaire
        metadata: {
          packId: freemiumPack._id.toString(),
        },
      });
  
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  




  

// Autres routes et logique du serveur ici...

module.exports = router;
