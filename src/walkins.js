const walkinOpenBtn = document.getElementById("walkinOpenBtn");
const walkinCloseBtn = document.getElementById("walkinCloseBtn");
const walkinModal = document.getElementById("walkinModal");

const closeWalkinModal = (e) => {
  if (e.target != walkinOpenBtn) {
    walkinModal.style.display = "none";
  }
};

walkinCloseBtn.addEventListener("click", closeWalkinModal);

window.addEventListener("click", closeWalkinModal);

walkinOpenBtn.addEventListener("click", () => {
  walkinModal.style.display = "block";
});
