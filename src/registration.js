//Opening and closing of modal 
const modal = document.getElementById('regModal');
const registerBtn = document.getElementById('registerBtn');
const closeBtn = document.getElementById('regCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const tabs = document.querySelectorAll(".tab");
let currentTab = 0;

registerBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click",closeModal);
window.addEventListener("click",closeModal);
// submitBtn.addEventListener("click", closeModal);

//styles select fields
const selectArray = document.querySelectorAll(".form-control.select");
selectArray.forEach((item) => {
  item.addEventListener("click", () => {
    if(item.value != "") {
      item.style.color = 'rgb(255,255,255)';
    }
  })
})

function resetSelectFields() {
  selectArray.forEach((item) => {
    item.style.color = 'rgba(255,255,255,0.5)';
  })
}

//open modal
function openModal() {
   modal.style.display = 'block';
   showTab(currentTab);
}

function closeModal(e) {
  if(e.target == modal || e.target == closeBtn) {
    modal.style.display = 'none';
    document.getElementById("regForm").reset();
    resetSelectFields();
    //resetTabs
    currentTab = 0;
    tabs.forEach((tab) => {
      tab.style.display = 'none';
    });
  }
}

const nextBtn = document.querySelector("#nextBtn");
const prevBtn = document.querySelector("#prevBtn");
nextBtn.addEventListener("click", nextTab);
prevBtn.addEventListener("click", prevTab);

function showTab(n) {
  tabs[n].style.display = "block";
  //show or hide previous button
  if(n == 0) { //first tab
    prevBtn.style.display = "none";
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
  if(n > 0 && n < tabs.length) { //anything in between
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
  if( n >= tabs.length - 1) { //last tab
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
  }
}

function nextTab() {
  //validate input
  tabs[currentTab].style.display = "none";
  currentTab = currentTab + 1;
  showTab(currentTab);
}

function prevTab() {
  tabs[currentTab].style.display = "none";
  currentTab = currentTab - 1;
  showTab(currentTab);
}

//Other option functionality. 
const genderGroup = document.querySelector("#Gender");
const GenderOptions = genderGroup.querySelectorAll(".form-check-label");
const otherOptionText = genderGroup.querySelector("#other-text-input");
GenderOptions.forEach((item) => {
  item.addEventListener("click", () => {
    if(item.id == "other-label") {
      otherOptionText.style.display = "inline";
      otherOptionText.focus();
    }
    else {
      otherOptionText.style.display = "none";
    }
  })
})