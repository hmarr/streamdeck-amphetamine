import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { ToggleSession } from "./actions/toggle-session";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the toggle action.
streamDeck.actions.registerAction(new ToggleSession());

// Finally, connect to the Stream Deck.
streamDeck.connect();
