import asyncHandler from "express-async-handler";
import { Subscriber } from "../models/Subscriber.js";

export const subscribe = asyncHandler(async (req, res) => {
  const { email, source = "website" } = req.body || {};

  if (!email || !email.trim()) {
    res.status(400);
    throw new Error("L'adresse email est requise");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Format d'email invalide");
  }

  // Check if email already exists
  const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      res.status(409);
      throw new Error("Cette adresse email est déjà inscrite à notre newsletter");
    } else {
      // Reactivate subscription
      existingSubscriber.isActive = true;
      existingSubscriber.unsubscribedAt = null;
      existingSubscriber.subscribedAt = new Date();
      await existingSubscriber.save();
      
      return res.json({ 
        message: "Votre inscription a été réactivée avec succès !",
        subscriber: {
          email: existingSubscriber.email,
          subscribedAt: existingSubscriber.subscribedAt
        }
      });
    }
  }

  // Create new subscriber
  const subscriber = await Subscriber.create({
    email: email.toLowerCase().trim(),
    source,
    isActive: true,
    subscribedAt: new Date()
  });

  res.status(201).json({
    message: "Inscription réussie ! Merci de votre confiance.",
    subscriber: {
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt
    }
  });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    res.status(400);
    throw new Error("L'adresse email est requise");
  }

  const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

  if (!subscriber) {
    res.status(404);
    throw new Error("Cette adresse email n'est pas inscrite");
  }

  if (!subscriber.isActive) {
    res.status(400);
    throw new Error("Cette adresse email est déjà désinscrite");
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({ message: "Vous avez été désinscrit avec succès." });
});

// Admin only - get all subscribers
export const getSubscribers = asyncHandler(async (req, res) => {
  const { active = "true" } = req.query;
  
  const filter = {};
  if (active === "true") filter.isActive = true;
  if (active === "false") filter.isActive = false;

  const subscribers = await Subscriber.find(filter)
    .sort({ subscribedAt: -1 })
    .select("email isActive subscribedAt source");

  res.json({ 
    subscribers,
    count: subscribers.length,
    activeCount: subscribers.filter(s => s.isActive).length
  });
});
