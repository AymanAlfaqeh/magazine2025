
// v4.3e: One-question-at-a-time randomized exam with shuffled choices and certificate.
const QUESTION_BANK = [
  {
    id:"q_plants_bryophytes",
    text:"أي مجموعة تُعد غير وعائية؟",
    options:[
      {k:"bryophytes", t:"الحزازيات (Bryophytes)", correct:true},
      {k:"angiosperms", t:"مغطّاة البذور", correct:false},
      {k:"gymnosperms", t:"مُعرّاة البذور", correct:false},
      {k:"ferns", t:"السرخسيات الوعائية", correct:false}
    ],
    explain:"الحزازيات غير وعائية وتمتص الماء مباشرة من البيئة."
  },
  {
    id:"q_animals_vertebrates",
    text:"تنتمي الثدييات إلى مجموعة:",
    options:[
      {k:"vertebrates", t:"الفقاريات", correct:true},
      {k:"invertebrates", t:"اللافقاريات", correct:false}
    ],
    explain:"الثدييات من الفقاريات لأنها تمتلك عمودًا فقريًا."
  },
  {
    id:"q_fungi_benefits",
    text:"الخميرة تُعد مثالًا على فطريات:",
    options:[
      {k:"useful_fungi", t:"نافعة", correct:true},
      {k:"harmful_fungi", t:"ضارة", correct:false}
    ],
    explain:"الخميرة تستخدم في صناعة الخبز والجبن."
  },
  {
    id:"q_bacteria_beneficial",
    text:"لاكتوباسيلس مثال على بكتيريا:",
    options:[
      {k:"beneficial_bact", t:"نافعة", correct:true},
      {k:"harmful_bact", t:"ضارة", correct:false}
    ],
    explain:"تساعد بكتيريا لاكتوباسيلس على الهضم وصناعة اللبن."
  },
  {
    id:"q_viruses_host",
    text:"تحتاج الفيروسات إلى ____ للتكاثر.",
    options:[
      {k:"host", t:"خلية مضيفة", correct:true},
      {k:"nothing", t:"لا تحتاج شيئًا", correct:false}
    ],
    explain:"الفيروسات لا تتكاثر إلا داخل خلايا العائل."
  },
  {
    id:"q_plants_angio",
    text:"أي مجموعة تنتج أزهارًا وثمارًا؟",
    options:[
      {k:"angiosperms", t:"مغطّاة البذور (Angiosperms)", correct:true},
      {k:"gymnosperms", t:"مُعرّاة البذور", correct:false}
    ],
    explain:"مغطّاة البذور تُنتج أزهارًا وتحتوي بذورها داخل ثمرة."
  },
  {
    id:"q_fungi_structure",
    text:"الفطريات الخيطية تتكوّن من خيوط دقيقة تُسمى:",
    options:[
      {k:"hyphae", t:"هيفات (Hyphae)", correct:true},
      {k:"cilia", t:"أهداب", correct:false},
      {k:"flagella", t:"أسواط", correct:false}
    ],
    explain:"الهيفات تُشكّل الميسيليوم في الفطريات الخيطية."
  },
  {
    id:"q_bact_shapes",
    text:"البكتيريا الكروية تُسمى:",
    options:[
      {k:"cocci", t:"Cocci (مكورات)", correct:true},
      {k:"bacilli", t:"Bacilli (عصيات)", correct:false},
      {k:"spirilla", t:"Spirilla (حلزونية)", correct:false}
    ],
    explain:"Cocci تعني مكورات كروية الشكل."
  }
];

const PASS_THRESHOLD = 4;         // النجاح من 4 فأكثر
const NUM_QUESTIONS = 6;          // عدد الأسئلة المولدة في كل محاولة

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function pickRandomQuestions(bank, n){
  // Prevent repetition across attempts using recent history
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('exam_recent_ids')||"[]"); } catch(e){ recent=[]; }
  const keep = Math.max(n*3, 12);
  const recentSet = new Set(recent.slice(-keep));
  let pool = bank.filter(q => !recentSet.has(q.id));
  if (pool.length < n) pool = bank.slice();

  const copy = [...pool];
  shuffle(copy);
  const picked = copy.slice(0, n).map(q => ({
    id:q.id, text:q.text, options: shuffle([...q.options]), explain:q.explain||""
  }));

  const pickedIds = picked.map(q=>q.id);
  const updated = [...recent, ...pickedIds].slice(-keep);
  try { localStorage.setItem('exam_recent_ids', JSON.stringify(updated)); } catch(e){}
  return picked;
}

let quizState = {
  name:"",
  questions:[],
  index:0,
  score:0,
  answers:[] // {id, chosenKey, correct}
};

function startQuiz(){
  const nmInput = document.getElementById('studentName');
  if(!nmInput) { alert('خطأ: لا يوجد حقل اسم.'); return; }
  const nmRaw = nmInput.value.trim();
  if(!nmRaw){ alert('الرجاء إدخال اسم الطالبة قبل البدء.'); return; }

  const nm = document.getElementById("studentName").value.trim();
  quizState.name = nm || "طالب/ـة";
  quizState.questions = pickRandomQuestions(QUESTION_BANK, NUM_QUESTIONS);
  quizState.index = 0;
  quizState.score = 0;
  quizState.answers = [];
  document.getElementById("introCard").style.display="none";
  document.getElementById("questionCard").style.display="block";
  renderQuestion();
}

function renderQuestion(){
  const q = quizState.questions[quizState.index];
  const container = document.getElementById("qContainer");
  const step = `${quizState.index+1} / ${quizState.questions.length}`;
  try{ const qc=document.getElementById('qContainer'); if(qc){ qc.dir='rtl'; qc.style.textAlign='right'; } }catch(e){} 
const optionsHtml = q.options.map((op,i)=>`
    <label class="opt">
      <input type="radio" name="qopt" value="${op.k}">
      <span>${op.t}</span>
    </label>
  `).join("");

  container.innerHTML = `
    <div class="q-head"><div class="step">السؤال ${step}</div><div class="q-text">${q.text}</div></div>
    <div class="q-options">${optionsHtml}</div>
    <div class="q-actions">
      <button class="btn" id="submitBtn">إجابة</button>
    </div>
    <div class="q-explain" id="qExplain" style="display:none"></div>
  `;

  document.getElementById("submitBtn").onclick = () => {
    const chosen = document.querySelector('input[name="qopt"]:checked');
    if(!chosen){ alert("اختر إجابة أولاً"); return; }
    const chosenKey = chosen.value;
    const isCorrect = q.options.find(o=>o.k===chosenKey)?.correct === true;
    if(isCorrect) quizState.score++;
    quizState.answers.push({id:q.id, chosenKey, correct:isCorrect});

    // Show explanation then Next
    const exp = document.getElementById("qExplain");
    exp.style.display="block";
    exp.innerHTML = `${isCorrect? "✔️ إجابة صحيحة":"❌ إجابة غير صحيحة"} — <span class="small">${q.explain}</span>`;
    document.getElementById("submitBtn").style.display="none";

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn next";
    nextBtn.textContent = (quizState.index < quizState.questions.length-1) ? "السؤال التالي" : "عرض النتيجة";
    nextBtn.onclick = () => nextStep();
    document.querySelector(".q-actions").appendChild(nextBtn);
  };
}

function nextStep(){
  if(quizState.index < quizState.questions.length-1){
    quizState.index++;
    renderQuestion();
  }else{
    showResult();
  }
}

function showResult(){
  document.getElementById("questionCard").style.display="none";
  const result = document.getElementById("result");
  const passNote = document.getElementById("passNote");
  const cert = document.getElementById("certificate");

  result.textContent = `النتيجة: ${quizState.score} / ${quizState.questions.length}`;
  if(quizState.score >= PASS_THRESHOLD){
    passNote.textContent = "مبروك! تم الاجتياز 🎉";
    try{ document.getElementById("pdfActions").style.display="block"; }catch(e){}
    cert.innerHTML = buildCertificateHTML(quizState.name, quizState.score, quizState.questions.length);
  }else{
    passNote.textContent = "لم يتم الاجتياز. حاول مرة أخرى.";
    cert.innerHTML = "";
  }
  document.getElementById("resultCard").style.display="block";
  // Optional: persist lightweight log in localStorage
  try{ localStorage.setItem("magz_last_score", JSON.stringify({name:quizState.name, score:quizState.score, total:quizState.questions.length, ts:Date.now()})); }catch(e){}
}


function buildCertificateHTML(name, score, total){ const d=new Date(); const ds=d.toLocaleDateString('ar-JO',{year:'numeric',month:'long',day:'numeric'}); setTimeout(()=>{ const el=document.getElementById('certDate'); if(el) el.textContent=ds; },0); return `
  <div id="certCanvas" style="display:flex;justify-content:center;align-items:center;">
    <div style="width:900px;max-width:100%;padding:28px;border-radius:18px;background:linear-gradient(135deg,#fffaf2,#fef3c7);border:2px solid #f59e0b;box-shadow:0 12px 40px rgba(0,0,0,.12);text-align:center">
      <div style="margin-bottom:8px;color:#b45309;font-weight:800;letter-spacing:.6px">وزارة التربية والتعليم</div>
      <h1 style="margin:6px 0 10px;font-size:34px;color:#7c2d12">شهادة التميز</h1>
      <div style="height:2px;background:linear-gradient(90deg,#b45309,#fbbf24,#b45309);border-radius:2px;margin:8px auto 16px;width:70%"></div>
      <p style="font-size:18px;line-height:2;color:#1f2937">
        تُمنح هذه الشهادة إلى<br>
        <span style="display:block;font-size:26px;font-weight:800;color:#111827;margin:8px 0">${name}</span>
        تقديرًا لتميّزها في اجتياز الاختبار النهائي للمجلة الإلكترونية.
      </p>
      <p style="font-size:16px;color:#374151;margin:8px 0">النتيجة: <strong>${score}</strong> من <strong>${total}</strong></p>
      <div style="margin-top:18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="min-width:180px;text-align:center">
          <div style="height:1px;background:#f1c27d;margin-bottom:6px"></div>
          <div style="font-size:14px;color:#6b7280"></div>
        </div>
        <div style="min-width:180px;text-align:center">
          <div style="height:1px;background:#f1c27d;margin-bottom:6px"></div>
          <div style="font-size:14px;color:#6b7280"></div>
        </div>
        <div style="min-width:180px;text-align:center">
          <div style="height:1px;background:#f1c27d;margin-bottom:6px"></div>
          <div style="font-size:14px;color:#6b7280">التاريخ: <span id="certDate"></span></div>
        </div>
      </div>
    </div>
  </div>`;
}

function downloadCertificatePDF(){
  const node = document.getElementById('certCanvas');
  if(!node){ alert('لا توجد شهادة لطباعتها.'); return; }
  const w = window.open('', '_blank', 'width=1000,height=800');
  const styles = `
    <style>
      body{ margin:0; font-family:'Segoe UI', Tahoma, Arial, sans-serif; }
      @page{ size:A4; margin:16mm; }
      @media print{
        .no-print{ display:none !important; }
      }
    </style>
  `;
  w.document.write('<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>شهادة التميز</title>'+styles+'</head><body>'+node.outerHTML+'</body></html>');
  w.document.close();
  w.focus();
  w.print();
}
