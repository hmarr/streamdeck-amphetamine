import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { runAppleScript } from "run-applescript";

const logger = streamDeck.logger.createScope("toggle-session");

@action({ UUID: "com.hmarr.amphetamine.toggle-session" })
export class ToggleSession extends SingletonAction<ActionSettings> {
	sessionActive: boolean = false;
	intervalId?: NodeJS.Timeout;

	/**
	 * Run when the action becomes visible - both when the stream deck starts, and when
	 * the page the action is in action is navigated to.
	 */
	async onWillAppear(ev: WillAppearEvent<ActionSettings>): Promise<void> {
		logger.info("onWillAppear");

		if (!this.intervalId) {
			logger.info("initializing toggle action")

			this.sessionActive = await checkForActiveSession();
			await ev.action.setTitle(`${this.sessionActive ? "On" : "Off"}`);
			await ev.action.setState(this.sessionActive ? 1 : 0);

			this.intervalId = setInterval(async () => {
				this.sessionActive = await checkForActiveSession();
				logger.info(`checking for active session: ${this.sessionActive}`);
				await ev.action.setTitle(`${this.sessionActive ? "On" : "Off"}`);
				await ev.action.setState(this.sessionActive ? 1 : 0);
			}, 2000);
		}
	}

	/**
	 * Run when the action becomes invisible - potentially when the stream deck shuts down,
	 * and when the page the action is in action is navigated away from.
	 */
	onWillDisappear(ev: WillDisappearEvent<ActionSettings>): void | Promise<void> {
		logger.info("onWillDisappear");
		if (this.intervalId) {
			logger.info(`clearing interval`);
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		}
	}

	/**
	 * Run whenever the action key is pressed.
	 */
	async onKeyDown(ev: KeyDownEvent<ActionSettings>): Promise<void> {
		logger.info("onKeyDown");
		if (this.sessionActive) {
			await endSession();
			this.sessionActive = false;
			await ev.action.setTitle(`Off`);
			await ev.action.setState(0);
		} else {
			await startSession();
			this.sessionActive = true;
			await ev.action.setTitle(`On`);
			await ev.action.setState(1);
		}
	}
}

/**
 * Settings for {@link ToggleSession}.
 */
type ActionSettings = {};

/**
 * Check if there is an active Amphetamine session.
 */
async function checkForActiveSession() {
	// TODO: check Amphetamine is installed

	const isSessionActive = await runAppleScript(`
		tell application "Amphetamine"
			return session is active
		end tell
	`);
	return isSessionActive === "true"
}

/**
 * Start a new Amphetamine session.
 */
async function startSession() {
	// TODO: check Amphetamine is installed

	await runAppleScript(`
    tell application "Amphetamine"
			start new session
    end tell
  `);
}

/**
 * End the current Amphetamine session.
 */
async function endSession() {
	// TODO: check Amphetamine is installed

	await runAppleScript(`
		tell application "Amphetamine"
			end session
		end tell
  `);
}