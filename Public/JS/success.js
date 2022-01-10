window.addEventListener("load", async () => {
  //Collect sessionId from localstorage
  let sessionID = localStorage.getItem("sessionID");
  if (sessionID === null) {
    return;
  }
  let verify = await fetch("/verify", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      sessionID,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      //Empties localstorage
      localStorage.removeItem("sessionID");
    })
    .catch((err) => console.error(err));
});