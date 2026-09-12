# Congress 101: student Civics Lab

Six interactive activities for Mr. James’s government classes at Granite Hills High School. Built with HTML, CSS, JavaScript, and local SVGs. No application dependencies, build step, accounts, or API keys.

## Student activities

1. **Get your bill passed:** branching student-transit proposal with committee, House, Senate cloture, bicameral agreement, and veto outcomes. All votes and policy changes are fictional.
2. **You hold the purse:** five-category, 100-credit budget. Students explain tradeoffs; no political preference is graded.
3. **Change the lines:** proportional example, packing, and cracking with exactly 20 A and 30 B voters in every grouping. Rows are conceptual groups, not geographic maps.
4. **Source detective:** a fictional viral claim, corrective feedback, and a legislative-record checklist.
5. **Discussion studio:** claim, evidence, counterargument, response, and what would change the student’s mind. Drafts, printable preview, and text download.
6. **Make it stick:** eight retrieval questions, explanations, and practice of missed questions only.

The hub also includes an exit ticket, printable 50-minute teacher plan, official-source links, and a maintained version of the original Congress guide with vocabulary cards and the ordering game.

## Files and local preview

- `index.html`: student hub
- `lab.css`, `lab.js`: design and activities
- `congress.html`: Congress study guide
- `sources.html`: citations, model assumptions, privacy, and maintenance notes
- `assets/`: original vector mark and illustrative chamber diagram

Serve this directory with an ordinary static web server, for example `npx http-server . -p 4173 -c-1`, and open `http://localhost:4173`. The hub also works from a file URL, though local storage behavior varies by browser. Internet access is needed for external sources, Google Fonts, and the guide’s YouTube embed; system fonts provide a fallback.

## Saved work

The local-storage key is `congress101-lab-v1`. Completion badges and written drafts persist per browser profile and origin. Bill steps and unfinished quiz rounds restart when reopened. No answers are sent to a teacher or collected by this application. Students must print, download, or use the school’s existing submission system. On shared devices, save needed work and clear this lab’s browser storage using its footer control. Preview and production origins have different stored work. Storage failures fall back to the current session with a visible notice.

## Accessibility and testing

The hub uses semantic buttons and labels, native modal dialogs, keyboard controls, visible focus, textual feedback, reduced-motion styles, a skip link, and letters alongside map colors. The guide’s ordering game supports Enter and Space. Print styles handle notes and the teacher plan. These changes are not a certification of full WCAG compliance.

Manual browser verification covers bill success and committee failure, budget arithmetic and reload persistence, all map totals, source retry/checklist, an eight-question run with targeted retry, draft save/preview, mobile widths, and the legacy ordering game. See the pull request for the final validation record.

## Deployment and content provenance

Existing Netlify site: `congress-101`, ID `f91e54b0-f3a5-4738-8910-f3072974d31b`; production domain: https://jdavis-gov.com/.

On September 12, 2026 the site’s Netlify API had no Git build repository configured. The GitHub repository is `jdavis-netizen/congress-101`, but its original main-branch HTML was older than the live Netlify HTML. The live HTML was captured as `congress.html` in commit `f0fc9a2` before revision. Do not assume merging a PR updates this Netlify site until a Git build connection is configured.

Deploy only the public site files above (not `.git`, local tooling, or notes). Link to the existing site and use a draft deploy first. Do not create a replacement Netlify site. Production publication is a separate release action.

Legacy links such as `/#basics`, `/#billgame`, and `/#quiz` redirect to the equivalent section in `congress.html` when JavaScript is available. Direct `congress.html#...` links also work without it. The original guide’s snapshot remains available in Git history.

## Editorial standards

Link procedural explanations to official sources. Date-check current bills, memberships, maps, and money figures before publishing them. Label invented scenarios and approximate models. Avoid suggesting an animated estimate is live data, that a ZIP uniquely identifies a district, that a conference committee is always required, or that a House vote alone creates a law. Political positions should be evaluated through accuracy, evidence, and reasoning, not agreement with a preferred view.

Educational use — free to fork, remix, and assign.
