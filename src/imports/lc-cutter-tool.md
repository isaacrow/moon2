SUPER PROMPT — Add LC Cutter to the Toolbar

You are tasked with building and integrating a new tool called “LC Cutter” into the toolbar of https://catalogingcalculator.com/
. This feature must be fully functional, visually consistent with the existing UI, and correctly wired into the application’s logic.

📌 FEATURE GOALS

Add an LC Cutter tool that:
✅ Appears prominently in the toolbar
✅ Allows users to enter a Library of Congress Call Number
✅ Returns a properly formatted LC Cutter output
✅ Integrates with the site’s existing UI patterns, styling, and state management
✅ Works responsively on desktop and mobile
✅ Shows errors clearly (invalid input, etc.)
✅ Provides accessible labels, tooltips, and guidance

🧠 USER EXPERIENCE

When a user clicks the LC Cutter icon/button in the toolbar:

UI Behavior

A modal or panel opens with:

Input field: “Enter LC Call Number”

Example helper text (e.g., “QA76.73.J38 2018”)

Submit / Clear buttons

Validation feedback if input is malformed

On submit:

Show formatted Cutter value(s)

Show breakdown (class, cutter, date, etc.)

Option to copy result

Option to download as text

The visual design must match the rest of the app.

🔧 TECHNICAL SPECIFICATIONS
✅ UI — Toolbar Integration

Add a new toolbar icon for “LC Cutter”:

Use an appropriate icon (scissors, cutter blade, LC monogram, etc.)

Tooltip: “LC Cutter”

Tab order and accessibility

Example:

<ToolbarButton
  icon={<BookOpen />}
  label="LC Cutter"
  onClick={() => openTool('lc-cutter')}
/>
✅ Route/View — LC Cutter Modal or Panel

Define a new route/view:

/tools/lc-cutter

OR as state in a UI manager:

{ tool: 'lc-cutter', params: {} }
✅ Form Implementation

Create a component:

/src/app/components/LCCutter.tsx

Fields:

<input
  type="text"
  name="lcCallNumber"
  placeholder="e.g., QA76.73.J38 2018"
/>
<button>Generate Cutter</button>
✅ Cutter Logic

Implement Cutter algorithm:

Given input like:

QA76.73.J38 2018

Produce output:

QA 76 .73 J38 2018

Rules:

Split class letters and numbers

Preserve Cutter letter

Normalize spaces

Uppercase output

Validate format

Provide clear error if invalid.

✅ State & Output

When user submits:

const formatted = generateLCCutter(input);

Then display:

<div class="lc-cutter-result">
  {formatted}
</div>
✅ Copy & Download

Add:
• Copy button
• Download result button (text)

Example:

<button onClick={() => copyToClipboard(result)}>Copy</button>
<button onClick={() => download(result, 'LC-Cutter.txt')}>Download</button>
📦 INTEGRATION POINTS
🧩 UI Library

Match existing styles (buttons, inputs, panels)

🔄 State Management

If the app uses redux / context:

Add tool key

Update routing / view mode mapping

📍 Analytics

Log when LC Cutter tool is opened and used

Example:

logEvent('ToolUsed', { tool: 'LC Cutter' });
🧪 Testing

Provide unit tests for:
✓ Valid LC call numbers
✓ Invalid input
✓ Edge cases
✓ Copy / download

📋 DELIVERY CHECKLIST

✔ Toolbar button added
✔ Tooltip and icon match theme
✔ Modal/panel renders properly
✔ Cutter interpretation logic implemented
✔ Result displays correctly
✔ Copy & download functions work
✔ Failure states handled gracefully
✔ Documented in code and UI
✔ Message/alert for invalid input

🎯 OPTIONAL ENHANCEMENTS (can be included)

🔸 Live preview as user types
🔸 Example selector dropdown (common call numbers)
🔸 API backend support (if desired later)
🔸 Help link in UI explaining LC Cutter rules
🔸 Keyboard shortcut to open tool

📦 WRAP-UP

Your LC Cutter tool should be:

🧩 Fully integrated
🎨 Style-consistent
⚡ Fast & responsive
📊 Validated with tests
📡 Ready for end-users

Build it once — build it right.