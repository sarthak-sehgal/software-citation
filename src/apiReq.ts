import { BASE_URL, resObjType } from "./config";

function getDoi(accessToken: string, cb: (obj: resObjType) => void): void {
  console.log(`getDoi function called. Requesting ${BASE_URL}/get-doi`);
  if (!accessToken || accessToken.trim() == "") {
    cb({
      status: 0,
      message: "Invalid Zenodo access token."
    });
  }
  fetch(`${BASE_URL}/get-doi`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    // **only for development**
    mode: "cors",
    body: JSON.stringify({
      token: accessToken
    })
  })
    .then(res => res.json())
    .then(res => {
      cb(res);
    })
    .catch(err => {
      console.log(err);
      cb({
        status: 0,
        message: "Server error occurred. Please try again."
      });
    })
    .catch(err => {
      console.log(err);
      cb({
        status: 0,
        message: "Server error occurred. Please try again."
      });
    });
}

function getGHData(
  githubUrl: string,
  cb: (obj: resObjType) => void
): void {
  console.log(`getGHData function called. Requesting ${BASE_URL}/get-gh-data`);

  fetch(`${BASE_URL}/get-gh-data`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    // **only for development**
    mode: "cors",
    body: JSON.stringify({
      githubUrl
    })
  })
    .then(res => res.json())
    .then(res => {
      cb(res);
    })
    .catch(err => {
      console.log(err);
      cb({
        status: 0,
        message: "Server error occurred. Please try again."
      });
    })
    .catch(err => {
      console.log(err);
      cb({
        status: 0,
        message: "Server error occurred. Please try again."
      });
    });
}

export { getDoi, getGHData };
