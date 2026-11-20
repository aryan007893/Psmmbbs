# FormPilot — V1 starter

Cross-platform Google Forms autofill starter:
- `pc-extension/`: Chrome Manifest V3 extension. Detects common Google Forms question controls, matches saved answers, fills fields, and leaves submission to the user.
- `android/`: Android Kotlin starter using an explicitly enabled AccessibilityService to inspect/fill visible controls in Chrome. Accessibility automation is best-effort and requires the user to enable the service.
- No CAPTCHA bypass, no hidden submission, no automatic submit.

## PC installation
1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked and select `pc-extension/`.
4. Open a Google Form, click the FormPilot extension, save answers in its profile, then click Fill form.
5. Review the form and submit manually.

The extension stores profile data in Chrome local storage. It is a starter: Google Forms' internal DOM can change, and some question types need additional adapters.

## Android
Open `android/` in Android Studio. Build and install the app, then explicitly enable FormPilot Accessibility in Android Settings > Accessibility. Open the form in Chrome and use the app's Fill action. Accessibility APIs vary by Android/Chrome versions; this starter is a proof of concept, not a guarantee for every form.

## Safety
Only use on forms you are authorized to complete. Check every answer before submitting. Avoid storing passwords, OTPs, or highly sensitive data.


## Form-specific exclusion rule
The PC prototype intentionally skips patient name, UHID, age, sex/gender, and department questions, even if matching values exist in the saved profile. These fields must be entered manually. Satisfaction scores and patient-written feedback should only be filled from actual patient-provided responses.
