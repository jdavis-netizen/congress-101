'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const KEY = 'congress101-lab-v1';
  const ids = ['bill', 'budget', 'map', 'source', 'debate', 'quiz'];
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state = { completed: [], drafts: {} }, storageOK = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') {
      state.completed = Array.isArray(saved.completed) ? [...new Set(saved.completed.filter(id => ids.includes(id)))] : [];
      if (saved.drafts && typeof saved.drafts === 'object' && !Array.isArray(saved.drafts)) state.drafts = saved.drafts;
    }
  } catch { storageOK = false; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; } catch { storageOK = false; }
    $('storage-note').textContent = storageOK ? 'Saved on this browser · no account needed' : 'Storage unavailable · keep this tab open or print your work';
  }
  function progress() {
    $('progress-text').textContent = `${state.completed.length} of 6 missions explored`;
    $('progress-fill').style.width = `${state.completed.length / 6 * 100}%`;
    document.querySelectorAll('[data-badge]').forEach(el => { el.textContent = state.completed.includes(el.dataset.badge) ? '✓ EXPLORED' : ''; });
  }
  function complete(id) { if (!state.completed.includes(id)) state.completed.push(id); save(); progress(); }
  const dialog = $('activity-dialog'), content = $('activity-content');
  let opener;
  function page(title, intro, body, label = 'CIVICS LAB') {
    $('activity-label').textContent = label;
    content.innerHTML = `<h2 id="activity-title" tabindex="-1">${title}</h2><p class="activity-intro">${intro}</p>${body}`;
    dialog.scrollTop = 0;
    if (dialog.open) $('activity-title').focus({ preventScroll: true });
  }
  function open(id, trigger) {
    opener = trigger || document.activeElement;
    ({bill:startBill,budget:budget,map:map,source:source,debate:debate,quiz:startQuiz,teacher:teacher,exit:exitTicket,clear:clearWork})[id]?.();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    $('activity-title').focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => open(button.dataset.open, button)));
  $('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus({ preventScroll: true }); });
  $('clear-progress').addEventListener('click', (e) => open('clear', e.currentTarget));
  function clearWork() {
    page('Clear saved work?', 'This removes only this Civics Lab’s notes and progress from this browser. Download your notes first if you want to keep them.', '<div class="button-row"><button class="button" id="keep-work">Keep my work</button><button class="button primary" id="confirm-clear">Clear my lab work</button></div>');
    $('keep-work').onclick = () => dialog.close();
    $('confirm-clear').onclick = () => { state = { completed: [], drafts: {} }; save(); progress(); dialog.close(); $('clear-status').textContent = storageOK ? 'Saved lab work cleared.' : 'Session work cleared; browser storage is unavailable.'; };
  }
  const sourceFoot = (href, name) => `<p class="small-note">Explore the real rule: <a class="source-link" href="${href}" target="_blank" rel="noopener noreferrer">${name} ↗</a></p>`;
  const constitution = 'https://www.archives.gov/founding-docs/constitution-transcript';
  const senate = 'https://www.senate.gov/about/powers-procedures/filibusters-cloture.htm';

  // Branching classroom scenario: fixed fictional vote totals, never forecasts.
  let billState;
  function startBill() { billState = { stage: 0, support: 205, senate: 54, scope: 'A permanent student transit grant program', notes: [] }; renderBill(); }
  const billStages = [
    {title:'First stop: the committee',text:'You are a House member proposing federal grants for student transit. The committee wants evidence of need and a way to evaluate the program. What do you bring?',options:[
      ['Student travel data + a one-year pilot','You narrow the program to a pilot with an evaluation. In this scenario, 25 more representatives support it.',25,4,'A one-year student transit pilot'],
      ['Keep the permanent program + add public reporting','You keep the broader program and add oversight. In this scenario, 15 more representatives support it.',15,2,'A permanent student transit program with public reporting'],
      ['A catchy slogan, without a funding plan','The committee tables the proposal. Attention helped people notice it, but members still need policy details.',0,0,'stalled']
    ]},
    {title:'The House floor',text:'The committee has reported your bill. A colleague asks to add a provision giving small towns access to the grants. Do you amend it?',options:[
      ['Add small-town eligibility','In this scenario, broader eligibility attracts 12 additional House votes and 5 senators. More communities qualify, so the same funding has to stretch further.',12,5],
      ['Keep the current eligibility rules','You preserve the original focus. No votes change in this scenario. A narrower program can concentrate benefits but leaves other communities out.',0,0]
    ]},
    {title:'A Senate roadblock',text:'The House passed the bill. In the Senate, opponents continue debate. For this ordinary bill, assume all 100 seats are filled and cloture requires 60 votes. What next?',options:[
      ['Negotiate an independent program review','Six senators agree to support cloture and final passage after you add an independent review. Oversight can build trust, but it adds administration.',0,6],
      ['Try the cloture vote with current support','You keep the bill as written and test your existing coalition. The outcome depends on the support you built.',0,0]
    ]},
    {title:'One identical text',text:'The Senate passed an amended version. The House must agree to the same text before it goes to the president. A conference committee is one option, not a required step for every bill.',options:[
      ['Have the House accept the Senate amendments','The House agrees in this scenario. Both chambers have now passed identical text.',0,0],
      ['Negotiate a compromise, then hold both votes','A conference committee produces a compromise that both chambers pass in this scenario. This route adds negotiation and another round of votes.',0,0]
    ]},
    {title:'The president says no',text:'The president vetoes the bill over its cost. Your staff counts 280 House votes and 65 Senate votes for an override. Assume every member votes. What is your next move?',options:[
      ['Try to override the veto','The override fails: 280 is below 290 in the House and 65 is below 67 in the Senate. Both chambers need two-thirds. The bill does not become law.',0,0,'veto'],
      ['Revise the proposal and start a new bill','You reduce the grant amount and negotiate a new proposal. In this scenario it passes both chambers and the president signs. The original bill stayed vetoed; the revised bill becomes law.',0,0,'law']
    ]}
  ];
  function renderBill() {
    const current = billStages[billState.stage];
    page('Get your bill passed.', 'You are sponsoring a student transit bill. The policy choices, vote changes, and outcomes below are fictional; the constitutional checkpoints are real.', `<div class="steps" aria-label="Decision ${billState.stage+1} of 5">${billStages.map((_,i)=>`<span class="${i<=billState.stage?'done':''}"></span>`).join('')}</div><div class="score-strip"><div><strong>${billState.support}</strong>House supporters / 435</div><div><strong>${billState.senate}</strong>Senate supporters / 100</div></div><div class="activity-panel"><p class="activity-meta">DECISION ${billState.stage+1} / 5</p><h3>${current.title}</h3><p>${current.text}</p><div class="choices">${current.options.map((o,i)=>`<button class="choice" data-choice="${i}">${o[0]}</button>`).join('')}</div><div class="feedback" id="bill-feedback" role="status"></div><div class="button-row"><button class="button primary" id="bill-next" hidden>Continue →</button></div></div>${sourceFoot(constitution,'Constitution, Article I, Section 7')}`, 'MISSION 01 / DECISION GAME');
    content.querySelectorAll('[data-choice]').forEach(button => button.onclick = () => {
      const o = current.options[Number(button.dataset.choice)];
      content.querySelectorAll('[data-choice]').forEach(b => b.disabled = true);
      billState.support += o[2]; billState.senate += o[3];
      billState.notes.push(`${current.title}: ${o[0]}. ${o[1]}`);
      if (billState.stage === 0 && o[4] !== 'stalled') billState.scope = o[4];
      let ending = o[4] === 'stalled' ? 'committee' : billState.stage === 4 ? o[4] : null;
      if (billState.stage === 2 && billState.senate < 60) ending = 'cloture';
      $('bill-feedback').textContent = o[1]; $('bill-next').hidden = false;
      $('bill-next').onclick = () => { if (ending) finishBill(ending); else { billState.stage++; renderBill(); } };
    });
  }
  function finishBill(result) {
    complete('bill');
    const results = {committee:['Your bill is still in committee.','Revise the proposal and try again. Getting attention is different from getting a committee to report a bill.'],cloture:['Debate continues.','Your coalition did not reach 60 votes for cloture. A majority favoring the bill does not necessarily overcome a filibuster.'],veto:['The veto stands.','With all members voting, an override needs 290 House votes and 67 Senate votes. Your coalition fell short in both chambers.'],law:['A revised bill becomes law.','The president signed the new, smaller proposal after both chambers passed it. You secured a policy win—and made a real tradeoff in its scope.']};
    state.drafts.bill = {result:results[result][0],notes:billState.notes}; save();
    page(results[result][0], results[result][1], `<p class="activity-meta">MISSION EXPLORED ✓</p><div class="activity-panel"><h3>Your decision trail</h3><ol>${billState.notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ol></div><div class="feedback">Discuss: Which compromise was worth making? Which would change the purpose of your bill too much?</div><p class="small-note">Ordinary passage generally requires a majority of those voting, with a quorum present. Cloture and veto overrides are different votes. The president can also allow a bill to become law after 10 days, excluding Sundays, unless adjournment prevents its return.</p><div class="button-row"><button class="button primary" id="bill-restart">Try another strategy ↻</button><button class="button" id="bill-exit">Write an exit ticket</button></div>${sourceFoot(constitution,'Constitution, Article I, Sections 5 and 7')}`,'MISSION 01 / DEBRIEF');
    $('bill-restart').onclick = startBill; $('bill-exit').onclick = exitTicket;
  }

  const categories = ['Health & support','Schools & research','Transportation','Defense & safety','Environment & parks'];
  function budget() {
    const saved = state.drafts.budget || {};
    const values = Array.isArray(saved.values) && saved.values.length === 5 ? saved.values.map(v=>Number.isFinite(v)?Math.max(0,Math.min(50,v)):20) : [25,20,15,25,15];
    page('You hold the purse.', 'Allocate a fictional 100-credit public budget. These categories and equal-sized credits are teaching tools, not actual federal spending shares. No allocation earns a political “right answer.”', `<div class="budget-total" role="status"><strong id="budget-number"></strong><p id="budget-outcome"></p></div>${categories.map((name,i)=>`<div class="range-row"><label for="budget-${i}">${name}</label><output id="value-${i}" for="budget-${i}">${values[i]}</output><input type="range" id="budget-${i}" min="0" max="50" step="1" value="${values[i]}" aria-describedby="budget-outcome"></div>`).join('')}<p class="small-note">A balanced budget, a deficit, and a surplus have different consequences. This simplified model omits interest, separate mandatory and discretionary rules, economic feedback, and changes in revenue.</p><form id="budget-form"><label for="budget-reflection">What did you prioritize, what did you give up, and who is affected?</label><textarea id="budget-reflection" required minlength="20" maxlength="3000" placeholder="I increased… This means less for… The tradeoff is…">${escape(saved.reflection||'')}</textarea><div class="button-row"><button class="button primary" type="submit">Save my budget & reasoning</button><button class="button" type="button" id="budget-reset">Reset sliders</button></div><p id="budget-saved" role="status"></p></form><p class="small-note"><a href="https://fiscaldata.treasury.gov/americas-finance-guide/" target="_blank" rel="noopener noreferrer">Compare with Treasury’s actual federal finance data ↗</a></p>`, 'MISSION 02 / BUDGET CHALLENGE');
    const record = () => { state.drafts.budget = { values: [...values], reflection: $('budget-reflection').value }; save(); };
    function update() {
      const sum = values.reduce((a,b)=>a+b,0), gap=sum-100;
      $('budget-number').textContent = `${sum} / 100 credits`;
      $('budget-outcome').textContent = gap>0 ? `${gap}-credit deficit. Spending exceeds revenue; financing the gap adds borrowing in this model.` : gap<0 ? `${-gap}-credit surplus. Revenue exceeds spending; explain how you would use the remainder.` : 'Balanced. Spending matches revenue. Balance alone does not tell us whether priorities are fair or effective.';
    }
    values.forEach((_,i)=>$(`budget-${i}`).oninput = (e) => { values[i]=Number(e.target.value); $(`value-${i}`).textContent=values[i]; update(); record(); });
    $('budget-reflection').oninput = record;
    $('budget-form').onsubmit = (e) => { e.preventDefault(); if ($('budget-reflection').value.trim().length<20) { $('budget-saved').textContent='Add a little more detail: at least 20 characters about your tradeoff.'; return; } record(); complete('budget'); $('budget-saved').textContent=storageOK?'Budget and reasoning saved. Mission explored ✓':'Mission explored ✓ Storage unavailable; print your field notes before closing.'; };
    $('budget-reset').onclick = () => { [25,20,15,25,15].forEach((v,i)=>{values[i]=v;$(`budget-${i}`).value=v;$(`value-${i}`).textContent=v;});update();record(); };
    update();
  }

  const mapModes = {proportional:{name:'Proportional example',counts:[6,6,3,3,2],why:'Group A wins 2 of 5 seats with 40% of the voters. Proportionality is one measure to discuss; it does not, by itself, prove that a map is fair.'},packing:{name:'Packing',counts:[10,3,3,2,2],why:'Ten A voters are concentrated in one district. A wins that seat, but the remaining A voters are outnumbered in all four other districts.'},cracking:{name:'Cracking',counts:[4,4,4,4,4],why:'A voters are distributed as a minority in every district. A wins no seats, even though its total vote share is still 40%.'}};
  function map() {
    const seen = new Set();
    page('Same voters. Different winners.', '50 voters. Five districts of 10. Group A has 20 voters; Group B has 30. Each district elects one member by majority. Predict the outcome, then change the grouping.', `<div class="mode-buttons" role="group" aria-label="District grouping">${Object.entries(mapModes).map(([id,m])=>`<button class="button" data-mode="${id}" aria-pressed="false">${m.name}</button>`).join('')}</div><div id="districts" class="districts"></div><div class="feedback" id="map-result" role="status"></div><p class="small-note">A = blue, B = rust. Letters and written results identify every group without relying on color. These rows model grouping, not geographic maps; real maps must also satisfy population, contiguity, voting-rights, and other applicable rules.</p><form id="map-form"><label for="map-reflection">What changed—and what stayed the same?</label><textarea id="map-reflection" required minlength="20" maxlength="3000" placeholder="The total votes stayed… but the seats changed because…">${escape(state.drafts.map||'')}</textarea><button class="button primary" type="submit" id="map-finish" disabled>Explore all 3 groupings, then save</button><p id="map-saved" role="status"></p></form><p class="small-note"><a href="congress.html#gerrymander">Read the redistricting study guide →</a></p>`, 'MISSION 03 / DISTRICT EXPERIMENT');
    function draw(id) {
      seen.add(id); const m=mapModes[id], seats=m.counts.filter(n=>n>5).length;
      content.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===id)));
      $('districts').innerHTML=m.counts.map((n,i)=>`<div class="district-row" role="img" aria-label="District ${i+1}: ${n} A voters, ${10-n} B voters; ${n>5?'A':'B'} wins"><small aria-hidden="true">${i+1}</small>${Array.from({length:10},(_,j)=>`<span class="voter ${j<n?'':'b'}" aria-hidden="true">${j<n?'A':'B'}</span>`).join('')}<span class="district-winner" aria-hidden="true">${n>5?'A':'B'} wins</span></div>`).join('');
      $('map-result').textContent=`A: ${seats} seats · B: ${5-seats} seats. Total: 20 A voters + 30 B voters. ${m.why}`;
      if(seen.size===3){$('map-finish').disabled=false;$('map-finish').textContent='Save my observation';}
    }
    content.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>draw(b.dataset.mode));
    $('map-reflection').oninput=()=>{state.drafts.map=$('map-reflection').value;save();};
    $('map-form').onsubmit=e=>{e.preventDefault();if(seen.size<3)return;if($('map-reflection').value.trim().length<20){$('map-saved').textContent='Describe the change in at least 20 characters.';return;}state.drafts.map=$('map-reflection').value;complete('map');$('map-saved').textContent=storageOK?'Observation saved. Mission explored ✓':'Mission explored ✓ Print your notes to keep them.';};
    draw('proportional');
  }

  function source() {
    page('Wait. Is that true?', 'You see this fictional post in a group chat. What would you check before sharing it?', `<div class="activity-panel"><p class="activity-meta">FICTIONAL POST / NO SOURCE ATTACHED</p><h3>“The House passed it. That means it’s the law now.”</h3><p>It has 42,000 likes. A screenshot says “PASSED.” There is no date, bill number, or link.</p></div><h3>What is the strongest next step?</h3><div class="choices"><button class="choice" data-check="0">Trust it—the vote screenshot looks official.</button><button class="choice" data-check="1">Find the bill number and read its actions on Congress.gov.</button><button class="choice" data-check="2">Check whether the account agrees with my views.</button></div><div class="feedback" id="source-feedback" role="status"></div><div id="source-evidence" hidden><h3>Your verification checklist</h3><div class="checklist"><label><input type="checkbox"> Identify the bill number and Congress; numbers are reused in later Congresses.</label><label><input type="checkbox"> Check the title, date, and latest action—not just the headline.</label><label><input type="checkbox"> Look for passage of identical text by both chambers and whether it became law.</label></div><p class="small-note">A Public Law number is a useful confirmation. Becoming law may follow a signature, an override, or the Constitution’s inaction rule.</p><button class="button primary" id="source-finish" disabled>Check all three steps to finish</button></div>${sourceFoot(constitution,'Constitution, Article I, Section 7')}<p><a class="source-link" href="https://www.congress.gov/browse" target="_blank" rel="noopener noreferrer">Try the checklist on Congress.gov ↗</a></p>`, 'MISSION 04 / SOURCE DETECTIVE');
    content.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{
      const correct=b.dataset.check==='1';
      $('source-feedback').textContent=correct?'Yes. Popularity and agreement do not establish accuracy. House passage alone is not enough. Find the actual legislative record and check what happened next.':'That does not establish whether the claim is true. A convincing screenshot or familiar viewpoint can leave out the Senate and the president. Try again.';
      if(correct){$('source-evidence').hidden=false;content.querySelectorAll('[data-check]').forEach(x=>x.disabled=true);}
    });
    content.querySelectorAll('.checklist input').forEach(input=>input.onchange=()=>{const ready=[...content.querySelectorAll('.checklist input')].every(x=>x.checked);$('source-finish').disabled=!ready;$('source-finish').textContent=ready?'Save my verification checklist':'Check all three steps to finish';});
    $('source-finish').onclick=()=>{complete('source');$('source-finish').textContent='Mission explored ✓';$('source-finish').disabled=true;};
  }

  const debateFields = [['claim','My claim','I think… because…'],['evidence','Evidence + source','A fact, example, or rule that supports my claim. Include a source title or URL.'],['counter','The strongest counterargument','Someone could reasonably disagree because…'],['response','My response or revised position','That concern matters. I would respond by…'],['question','What would change my mind?','I would reconsider if the evidence showed…']];
  function debate() {
    const draft=state.drafts.debate||{};
    page('Disagree. With evidence.', 'Discussion question: Should the Senate keep the current 60-vote cloture threshold for most legislation? Defend a position, consider an objection, and decide what evidence would change your mind.', `<div class="activity-panel"><h3>Two starting points</h3><p><strong>For keeping it:</strong> Supporters argue it encourages broader coalitions and protects minority-party influence.</p><p><strong>For changing it:</strong> Critics argue it lets a minority block policies supported by a majority and reduces accountability.</p><p class="small-note">These are arguments to examine, not conclusions you have to adopt. Cloture ends debate; it is different from the final vote on a bill. Special procedures and nominations can have different rules.</p>${sourceFoot(senate,'U.S. Senate: filibusters and cloture')}</div><form id="debate-form">${debateFields.map(([id,label,placeholder])=>`<label for="debate-${id}">${label}</label><textarea id="debate-${id}" maxlength="3000" required minlength="10" placeholder="${placeholder}">${escape(draft[id]||'')}</textarea>`).join('')}<div class="button-row"><button class="button primary" type="submit">Save my argument</button><button class="button" id="debate-print" type="button">Preview / print my argument</button></div><p class="small-note">Drafts save on this browser. There is no automatic grading or submission. Use your class’s normal assignment process.</p><p id="debate-status" role="status"></p></form>`, 'MISSION 05 / DISCUSSION STUDIO');
    const record=()=>{state.drafts.debate=Object.fromEntries(debateFields.map(([id])=>[id,$(`debate-${id}`).value]));save();};
    content.querySelectorAll('textarea').forEach(t=>t.oninput=record);
    $('debate-form').onsubmit=e=>{e.preventDefault();if(debateFields.some(([id])=>$(`debate-${id}`).value.trim().length<10)){$('debate-status').textContent='Add at least 10 characters of reasoning to each response.';return;}record();complete('debate');$('debate-status').textContent=storageOK?'Argument saved. Mission explored ✓ Your teacher evaluates your reasoning, not your political position.':'Mission explored ✓ Storage unavailable; use the print preview to keep your argument.';};
    $('debate-print').onclick=()=>{record();previewNotes('My argument',debateFields.map(([id,label])=>[label,state.drafts.debate[id]]),debate);};
  }
  function previewNotes(title, rows, back) {
    page(title,'Congress 101 · Mr. James’s government class',`<p class="print-title">Name: __________________________ &nbsp; Period: ______ &nbsp; Date: __________</p>${rows.map(([label,value])=>`<div class="activity-panel"><h3>${escape(label)}</h3><p class="worksheet-value">${escape(value||'(Not yet answered)')}</p></div>`).join('')}<div class="button-row"><button class="button primary" id="print-notes">Print / save as PDF</button><button class="button" id="download-notes">Download text</button><button class="button" id="back-notes">Back to editing</button></div>`,'FIELD NOTES / PRINT PREVIEW');
    $('print-notes').onclick=()=>window.print(); $('back-notes').onclick=back;
    $('download-notes').onclick=()=>{const blob=new Blob([`${title}\nCongress 101\n\n${rows.map(([k,v])=>`${k}\n${v||'(Not yet answered)'}`).join('\n\n')}`],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='congress-101-field-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  }
  function exitTicket() {
    const fields=[['learned','One concept I can now explain'],['evidence','A source or example that supports my explanation'],['next','One question I still have']];
    const draft=state.drafts.exit||{};
    page('Take your thinking with you.', 'Write a short exit ticket. Add evidence and a next question. Your notes stay on this browser until you clear them; download or print a copy to keep.', `<form id="exit-form">${fields.map(([id,label])=>`<label for="exit-${id}">${label}</label><textarea id="exit-${id}" maxlength="3000">${escape(draft[id]||'')}</textarea>`).join('')}<div class="button-row"><button class="button primary" type="submit">Preview my field notes</button></div></form>`, 'YOUR VOICE / EXIT TICKET');
    const record=()=>{state.drafts.exit=Object.fromEntries(fields.map(([id])=>[id,$(`exit-${id}`).value]));save();};
    content.querySelectorAll('textarea').forEach(t=>t.oninput=record);
    $('exit-form').onsubmit=e=>{e.preventDefault();record();const rows=fields.map(([id,label])=>[label,state.drafts.exit[id]]);if(state.drafts.budget)rows.push(['My budget',categories.map((c,i)=>`${c}: ${state.drafts.budget.values[i]} credits`).join('\n')+'\n'+state.drafts.budget.reflection]);if(state.drafts.map)rows.push(['District experiment',state.drafts.map]);if(state.drafts.bill)rows.push(['My bill simulation',state.drafts.bill.result+'\n'+state.drafts.bill.notes.join('\n')]);previewNotes('My civics field notes',rows,exitTicket);};
  }

  const questions = [
    {q:'The House passes a bill. What must happen before it can be sent to the president?',o:['The Senate must pass identical text.','The Supreme Court must approve it.','Every governor must sign it.'],a:0,why:'Both chambers must agree on identical text. A conference committee is one way to resolve differences, but it is not required for every bill.',link:constitution},
    {q:'Why can a senator from a small state have the same vote as a senator from a large state?',o:['The Senate uses proportional representation.','Every state has two senators.','Only large states have House members.'],a:1,why:'Senate representation is equal by state. House seats are apportioned by population, with each state guaranteed at least one.',link:constitution},
    {q:'An ordinary Senate bill has 54 supporters. Does that guarantee they can overcome a filibuster?',o:['Yes, 51 always ends debate.','No, ordinary cloture usually requires 60 when all seats are filled.','No, every bill requires unanimity.'],a:1,why:'Cloture and final passage are different decisions. For most legislation, cloture requires three-fifths of senators duly chosen and sworn. Special procedures can differ.',link:senate},
    {q:'All members vote on a veto override. Which pair meets the thresholds?',o:['218 House; 51 Senate','290 House; 67 Senate','435 House; 60 Senate'],a:1,why:'Two-thirds in both chambers is required. With 435 House members and 100 senators voting, that is 290 and 67.',link:constitution},
    {q:'A group has 40% of voters but wins none of five districts. Which arrangement explains this?',o:['It has 4 of 10 voters in every district.','It has 10 of 10 voters in two districts.','Its voters count twice.'],a:0,why:'Four out of ten loses each district. This illustrates cracking: spreading a group across districts where it remains a minority.',link:'congress.html#gerrymander'},
    {q:'A public budget spends 110 credits and collects 100. What is the annual gap?',o:['A 10-credit surplus','A 110-credit debt','A 10-credit deficit'],a:2,why:'A deficit is spending minus revenue for a period. Debt is accumulated borrowing outstanding; it is not the same measure as one year’s deficit.',link:'https://fiscaldata.treasury.gov/americas-finance-guide/'},
    {q:'Which chamber brings impeachment charges, and which holds the trial?',o:['Senate charges; House tries','House charges; Senate tries','Supreme Court does both'],a:1,why:'The House has the sole power of impeachment. The Senate has the sole power to try impeachments. An impeachment itself does not remove an official.',link:constitution},
    {q:'Which evidence best supports the claim that a bill became law?',o:['A popular video says it passed.','Its sponsor says it will pass.','The official record lists enactment and a Public Law number.'],a:2,why:'Check the legislative record, bill number, Congress, and date. Popularity and a sponsor’s prediction do not establish enactment.',link:'https://www.congress.gov/browse'}
  ];
  let quizState;
  function startQuiz(list=questions.map((_,i)=>i)) { quizState={list,at:0,correct:0,missed:[]};renderQuiz(); }
  function renderQuiz() {
    if(quizState.at===quizState.list.length){complete('quiz');page('Keep the reasoning.','A score is a checkpoint. Review the explanations and revisit any ideas that are still unclear.',`<div class="score-strip"><div><strong>${quizState.correct} / ${quizState.list.length}</strong>correct this round</div><div><strong>${quizState.missed.length}</strong>to revisit</div></div>${quizState.missed.length?`<div class="activity-panel"><h3>Review these ideas</h3><ul>${quizState.missed.map(i=>`<li>${questions[i].q}<p class="small-note">${questions[i].why}</p></li>`).join('')}</ul></div>`:'<div class="feedback">All correct this round. Try explaining one answer to a classmate without looking.</div>'}<div class="button-row">${quizState.missed.length?'<button class="button primary" id="quiz-missed">Practice missed questions</button>':''}<button class="button" id="quiz-again">Restart all 8 questions</button></div>`,'MISSION 06 / PRACTICE RESULTS');if($('quiz-missed'))$('quiz-missed').onclick=()=>startQuiz([...quizState.missed]);$('quiz-again').onclick=()=>startQuiz();return;}
    const index=quizState.list[quizState.at],q=questions[index];
    page('Make it stick.', 'Choose an answer, then read why. You can retry missed questions after this round.', `<p class="activity-meta">QUESTION ${quizState.at+1} / ${quizState.list.length}</p><div class="activity-panel"><h3>${q.q}</h3><div class="choices">${q.o.map((o,i)=>`<button class="choice" data-answer="${i}">${escape(o)}</button>`).join('')}</div><div class="feedback" id="quiz-feedback" role="status"></div><button class="button primary" id="quiz-next" hidden>${quizState.at===quizState.list.length-1?'See my results':'Next question →'}</button></div>`, 'MISSION 06 / RETRIEVAL PRACTICE');
    content.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const picked=Number(b.dataset.answer);content.querySelectorAll('[data-answer]').forEach(x=>{x.disabled=true;if(Number(x.dataset.answer)===q.a)x.classList.add('correct');else if(x===b)x.classList.add('wrong');});if(picked===q.a)quizState.correct++;else quizState.missed.push(index);$('quiz-feedback').innerHTML=`<strong>${picked===q.a?'Correct.':'Not quite. Correct answer: '+escape(q.o[q.a])}</strong><p>${q.why}</p><a class="source-link" href="${q.link}" target="_blank" rel="noopener noreferrer">Read the source ↗</a>`;$('quiz-next').hidden=false;});
    $('quiz-next').onclick=()=>{quizState.at++;renderQuiz();};
  }
  function teacher() {
    page('One class. Better questions.', 'A flexible 50-minute plan for a high school government class. Students need one browser per person or pair; there are no accounts or automatic submissions.', `<div class="activity-panel"><h3>Today’s learning targets</h3><ul><li>Explain how bicameralism and vetoes shape a bill’s path.</li><li>Distinguish final passage from cloture and a veto override.</li><li>Use evidence to explain a policy tradeoff.</li></ul></div><ol><li><strong>0–5 min · Hook.</strong> “A policy has majority support. Why might it still fail?” Collect predictions.</li><li><strong>5–12 min · Ground the class.</strong> Read the House/Senate comparison and bill process in the study guide.</li><li><strong>12–27 min · Paired simulation.</strong> Students run the bill mission twice with different choices. One makes decisions; the other records consequences. Switch roles.</li><li><strong>27–38 min · Choose a second lens.</strong> Budget challenge, district experiment, or source detective. Require an explanation, not just a result.</li><li><strong>38–45 min · Compare.</strong> Partners share the strongest tradeoff and one reason someone might disagree.</li><li><strong>45–50 min · Exit ticket.</strong> One concept, one supporting source, one unanswered question. Print or submit through your existing classroom system.</li></ol><div class="activity-panel"><h3>Assess the reasoning (0–2 each)</h3><ul><li><strong>Accuracy:</strong> Correctly identifies the rule or concept.</li><li><strong>Evidence:</strong> Uses a relevant source or observation.</li><li><strong>Tradeoff:</strong> Explains a cost, benefit, or competing viewpoint.</li></ul><p>Do not award points for agreeing with a political position. “Explored” badges record activity completion, not mastery or verified student identity.</p></div><details><summary>Adaptations and extension ideas</summary><p>Read prompts aloud, let partners dictate responses, and use the guide’s vocabulary cards. Keyboard controls work throughout the lab. For an extension, apply the source checklist to a current bill and record the date you checked it.</p><p>Discussion stems: “My evidence is…” · “A reasonable objection is…” · “I changed my mind because…”</p></details><p class="small-note">On shared devices, download any work students want to keep, then use “Clear this browser’s saved work.” Browser storage is not a teacher dashboard. Preview and production URLs have separate saved work.</p><div class="button-row"><button class="button primary" id="teacher-print">Print this lesson plan</button><a class="button" href="sources.html" target="_blank" rel="noopener">Sources & model notes ↗</a></div>`,'TEACHER TOOLKIT / 50 MINUTES');
    $('teacher-print').onclick=()=>window.print();
  }
  // Preserve links teachers may already have assigned to the original one-page guide.
  const oldAnchors=['basics','reps','ballot','bill','billgame','powers','dirty','gerrymander','pork','lobby','money','live','vocab','quiz'];
  function routeLegacyAnchor() { if(oldAnchors.includes(location.hash.slice(1))) location.replace('congress.html'+location.hash); }
  window.addEventListener('hashchange', routeLegacyAnchor);
  routeLegacyAnchor();
  save();progress();
})();
