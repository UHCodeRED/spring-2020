//Opening and closing of modal
const modal = document.getElementById("regModal");
const registerBtn = document.getElementById("registerBtn");
const closeBtn = document.getElementById("regCloseBtn");
const submitBtn = document.getElementById("submitBtn");
const tabs = document.querySelectorAll(".tab");
const noticeModal = document.querySelector("regNoticeModal");
let currentTab = 0;

registerBtn.addEventListener("click", () => {
  console.log(noticeModal);
  noticeModal.style.display = "block";
  console.log("click");
});

registerBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", closeModal);
// submitBtn.addEventListener("click", closeModal);

//styles select fields
const selectArray = document.querySelectorAll(".form-control.select");
selectArray.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.value != "") {
      item.style.color = "rgb(255,255,255)";
    }
  });
});

//Other option functionality.
const genderGroup = document.querySelector("#Gender");
const GenderOptions = genderGroup.querySelectorAll(".form-check-label");
const otherOptionText = genderGroup.querySelector("#other-text-input");
GenderOptions.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.id == "other-label") {
      otherOptionText.style.display = "inline";
      otherOptionText.focus();
    } else {
      otherOptionText.style.display = "none";
    }
  });
});

function resetSelectFields() {
  selectArray.forEach((item) => {
    item.style.color = "rgba(255,255,255,0.5)";
  });
}

//show resume name
const resume = document.getElementById("resume");
resume.addEventListener("change", (e) => {
  document.getElementById("resumeName").innerHTML = e.target.files[0].name;
});

//open modal
function openModal() {
  modal.style.display = "block";
  showTab(currentTab);
}

function closeModal(e) {
  if (e.target == modal || e.target == closeBtn) {
    modal.style.display = "none";
    document.getElementById("regForm").reset();
    resetSelectFields();
    //reset Tabs
    currentTab = 0;
    tabs.forEach((tab) => {
      tab.style.display = "none";
    });
    //reset Resume Selection
    document.getElementById("resumeName").innerHTML = "";
  }
}

const nextBtn = document.querySelector("#nextBtn");
const prevBtn = document.querySelector("#prevBtn");
nextBtn.addEventListener("click", nextTab);
prevBtn.addEventListener("click", prevTab);

function showTab(n) {
  tabs[n].style.display = "block";
  //show or hide previous button
  if (n == 0) {
    //first tab
    prevBtn.style.display = "none";
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
  if (n > 0 && n < tabs.length) {
    //anything in between
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
  if (n >= tabs.length - 1) {
    //last tab
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
  }
}

function nextTab() {
  //validate input
  if (currentTab == 0) {
    const passedNameTest = validateName();
    const passedPhoneNumberTest = validatePhoneNumber();
    const passedEmailTest = validateEmail();

    const nameErrorMessage = document.getElementById("nameErrorMessage");
    const emailErrorMessage = document.getElementById("emailErrorMessage");
    const phoneNumberErrorMessage = document.getElementById(
      "phoneNumberErrorMessage"
    );
    if (!passedNameTest) {
      nameErrorMessage.style.display = "block";
    } else {
      nameErrorMessage.style.display = "none";
    }
    if (!passedEmailTest) {
      emailErrorMessage.style.display = "block";
    } else {
      emailErrorMessage.style.display = "none";
    }
    if (!passedPhoneNumberTest) {
      phoneNumberErrorMessage.style.display = "block";
    } else {
      phoneNumberErrorMessage.style.display = "block";
    }
    if (passedNameTest && passedEmailTest && passedPhoneNumberTest) {
      nameErrorMessage.style.display = "none";
      emailErrorMessage.style.display = "none";
      phoneNumberErrorMessage.style.display = "none";
      tabs[currentTab].style.display = "none";
      currentTab = currentTab + 1;
      showTab(currentTab);
    }
  }
  //checks if correct age is entered.
  else if (currentTab == 1) {
    const passedAgeTest = validateAge();
    const phoneNumberErrorMessage = document.getElementById("ageErrorMessage");
    if (!passedAgeTest) {
      ageErrorMessage.style.display = "block";
    } else {
      ageErrorMessage.style.display = "none";
      tabs[currentTab].style.display = "none";
      currentTab = currentTab + 1;
      showTab(currentTab);
    }
  } else {
    tabs[currentTab].style.display = "none";
    currentTab = currentTab + 1;
    showTab(currentTab);
  }
}

function prevTab() {
  tabs[currentTab].style.display = "none";
  currentTab = currentTab - 1;
  showTab(currentTab);
}

//Form validation
//validate email field.
function validateEmail() {
  const emailValue = document.getElementById("email").value;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(emailValue).toLowerCase());
}

//validate Name field.
function validateName() {
  const nameValue = document.getElementById("name").value;
  if (nameValue == "") {
    return false;
  }
  return true;
}

//validate Phone Number field.
function validatePhoneNumber() {
  const phoneNumberValue = document.getElementById("phoneNumber").value;
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(phoneNumberValue));
}

function validateAge() {
  const ageValue = document.getElementById("age").value;
  const re = /^[1-9]?[0-9]{1}$|^100$/;
  return re.test(String(ageValue));
}

//send post request to the server.
registrationForm = document.getElementById("regForm");
submitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  let formData = new FormData(registrationForm);
  fetch("https://radiant-tundra-50768.herokuapp.com/", {
    method: "POST",
    body: formData,
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
  modal.style.display = "none";

  document.getElementById("confirm").style.display = "block";

  setTimeout(() => {
    document.getElementById("confirm").style.display = "none";
  }, 2900);
});
