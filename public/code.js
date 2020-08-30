
let currentStudent = {};
let divCurrentStudent = document.getElementById("div-accepted");
let divStatus = document.getElementById("div-status");
let btnAccept = document.getElementById("bnt-accept");
let btnClear = document.getElementById("btn-clear")
let student = document.getElementById("student");
let btnNext = document.getElementById("btn-next");
let btnStatus = document.getElementById("btn-status");

let interValClear;
let dotCount = 0;
let showClearBtn = false;
let requiresAccept = true;

(function adjustSettings() {
  fetch("/api/settings").
    then(res => res.json()).
    then(settings => {
      console.log(settings)
      if (settings.title) {
        document.getElementById("title").innerHTML = settings.title;
      }
      if (settings.getText) {
        btnNext.innerHTML = settings.getText;
      }
      if (settings.statusBtnText) {
        btnStatus.innerHTML = settings.statusBtnText;
      }
      if (settings.statusTitle) {
        document.getElementById("statusHeader").innerHTML = settings.statusTitle;
      }
      if (settings.tableHeader1) {
        document.getElementById("th-col1").innerHTML = settings.tableHeader1;
      }
      if (settings.tableHeader2) {
        document.getElementById("th-col2").innerHTML = settings.tableHeader2;
      }
      if (settings.statusText) {
        document.getElementById("info-for-status-page").innerHTML = settings.statusText;
      }
      showClearBtn = settings.showClearBtn
      requiresAccept = settings.requiresAccept;




      btnClear.style.display = showClearBtn ? "inline-block" : "none"
    })
})()


function clearStudentStyles(marginTop, fontSize) {
  student.style.fontSize = fontSize + "em"
  student.style.marginTop = marginTop + "px";
}

function setUiStatus(showCurrentStudent, showStatusDiv) {



  if (showCurrentStudent && !showStatusDiv) {
    divCurrentStudent.style.display = "block";
    btnAccept.style.display = "block";
    divStatus.style.display = "none";
  }
  else if (!showCurrentStudent && !showStatusDiv) {
    divCurrentStudent.style.display = "none";
    btnAccept.style.display = "none";
    divStatus.style.display = "none";
  }
  else if (showStatusDiv) {
    divCurrentStudent.style.display = "none";
    btnAccept.style.display = "none";
    divStatus.style.display = "block";
  }
}

async function updatePresentations(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  if (evt.target.type !== "button") {
    console.log("RETURN")
    return
  }
  const id = evt.target.id;
  const isIncrement = evt.target.innerHTML.includes("+");
  const inc = isIncrement ? 1 : -1;
  const body = { id: evt.target.id, inc };

  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  await fetch("api/increment-presentations", options).then(r => r.json())
  presentationStatus();

}

function onPresentationStatus() {
  setUiStatus(false, false);
  presentationStatus();
}

function presentationStatus() {
  currentStudent = {};
  const options = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/presentation-status", options).then(r => r.json())
    .then(result => {
      setUiStatus(false, true)
      document.getElementById("tries").innerHTML = result.tries;
      const rows = result.status.map(n => {
        return `<tr><td>${n.name}</td><td>
          <button type="button" id=${n.id}
               class="btn btn-outline-danger btn-sm" style="margin-right:2.5em;font-family:'courier'"> - </button>
               <span style="width: 50px;display: inline-block;text-align:center">${n.presentations}</span>
          <button type="button" id=${n.id}
                class="btn btn-outline-success btn-sm" style="margin-left:2.5em;;font-family:'courier'"> + </button</td></tr>`;
      })
      document.getElementById("tbody").innerHTML = rows.join("");
    })
}

function clearAllPresentations() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/clear-all-presentations", options).then(r => r.json())
    .then(status => {
      setUiStatus(false, false)
      document.getElementById("tbody").innerHTML = "";
    })
}

function incrementAllowedPresentations() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/increase-allowed-presentations", options).then(r => r.json())
    .then(status => {
      setUiStatus(false, false)
      document.getElementById("tbody").innerHTML = "";
    })
}
function decrementAllowedPresentations() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/decrement-allowed-presentations", options).then(r => r.json())
    .then(status => {
      setUiStatus(false, false)
      document.getElementById("tbody").innerHTML = "";
    })
}

function nextStudent() {
  if (interValClear) {
    //Cannot request new, while 'animation' is running"
    return
  }
  setUiStatus(false, false)
  currentStudent = {};
  student.style.marginTop = 0;
  const options = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }


  fetch("api/next-student", options).then(r => r.json())
    .then(d => {
      currentStudent = d;
      student.innerHTML = d.name;
      setUiStatus(true, false)
      if (!requiresAccept) {
        setTimeout(() => btnAccept.click(), 0)
      }

    })
}

function studentAccepts() {

  let div = document.getElementById("div-accepted");

  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currentStudent)
  }
  fetch("/api/student-accepted", options).then(r => r.json())
    .then(d => {
      dotCount = 0;
      btnAccept.style.display = "none"
      let marginTop = 0;
      let fontSize = 1.5;
      clearStudentStyles(marginTop, fontSize);

      interValClear = setInterval(() => {
        let val = student.innerHTML;
        //val = dotCount === 0 ? "&#x2192;  " + val : "&#x2192;" + val;
        student.innerHTML = val;
        marginTop += 10;
        fontSize += 0.5;
        student.style.marginTop = marginTop + "px";
        student.style.fontSize = fontSize + "em"
        dotCount++;
        if (dotCount === 10) {
          clearInterval(interValClear);
          interValClear = null
        }
      }, 50)
    })
}

document.getElementById("btn-next").onclick = nextStudent;
document.getElementById("bnt-accept").onclick = studentAccepts;
btnStatus.onclick = onPresentationStatus;
document.getElementById("btn-clear-all").onclick = clearAllPresentations;
document.getElementById("btn-inc").onclick = incrementAllowedPresentations;
document.getElementById("btn-dec").onclick = decrementAllowedPresentations;
btnClear.onclick = () => {
  clearStudentStyles(0, 1.5);

  student.innerHTML = ""
};

document.getElementById("tbody").onclick = updatePresentations;