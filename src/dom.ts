import 'bootstrap';
import * as jQuery from "jquery";
import { getDoi, getGHData } from './apiReq';
import { resObjType } from './config';
const delay = require('delay');
let $: any = jQuery;

/** Variables */
const getStartedBtnDiv = <HTMLButtonElement>document.getElementById('get-started-btn')!;
const navItems = document.getElementsByClassName('nav-link')!;
const warningModalContinueBtn = <HTMLButtonElement>document.getElementById('warningModalContinueBtn')!;
const warningModalStayBtn = <HTMLButtonElement>document.getElementById('warningModalStayBtn')!;
const step1Form = <HTMLFormElement>document.getElementById('step1-form')!;
const zenodoToken = <HTMLInputElement>document.getElementById('zenodoToken')!;
const githubURL = <HTMLInputElement>document.getElementById('githubURL')!;
const stepOneError = document.getElementById('stepOneError')!;
const spinnerDiv = document.getElementById('spinnerDiv')!;
const ghUrlWarning = document.getElementById('ghUrlWarning')!;
const step2Form = <HTMLFormElement>document.getElementById('step2-form')!;
const step2BackBtn = <HTMLButtonElement>document.getElementById('step2-back-btn');
const progressBar = document.getElementById('progress-bar')!;
const step3BackBtn = <HTMLButtonElement>document.getElementById('step3-back-btn')!;
const step2FormFields: {
	title: HTMLInputElement,
	["date-released"]: HTMLInputElement,
	version: HTMLInputElement,
	doi: HTMLInputElement
	message: HTMLInputElement,
	abstract: HTMLInputElement
} = {
	title: <HTMLInputElement>document.getElementById('form-title')!,
	["date-released"]: <HTMLInputElement>document.getElementById('form-release-date')!,
	version: <HTMLInputElement>document.getElementById('form-release-version')!,
	doi: <HTMLInputElement>document.getElementById('form-doi')!,
	message: <HTMLInputElement>document.getElementById('form-message')!,
	abstract: <HTMLInputElement>document.getElementById('form-abstract')!
}

let isGettingStartedClicked = false;
let navItemUrl: string;

type authorType = {
	["family-names"]: string,
	["given-names"]: string,
	orcid?: string,
	email?: string,
	webstie?: string
};

let data: {
    doi?: string,
    date?: string,
    version?: string,
    title?: string,
    abstract?: string,
		keywords?: [string],
		license?: string,
		repository?: string,
		url?: string,
		authors?: [authorType]
} = {};

/** Utility Functions */
function fadeOutDiv (id: string, dur: number) {
    $('#'+id).fadeOut(dur);
}

function fadeInDiv (id: string, dur: number) {
    $('#'+id).fadeIn(dur);
}

function crossFadeDivs (idOut: string, idIn: string, dur: number, cb?: () => void) {
    (async () => {
        fadeOutDiv(idOut, dur/2);
        setTimeout(() => fadeInDiv(idIn, dur/2), 0.8*dur);
        if (cb) {
            await delay(dur);
            cb();
        }
    })();
}

/** DOM changes */
// startup changes
fadeOutDiv('spinnerDiv', 0);

// cross fade on get started button click
getStartedBtnDiv.addEventListener('click', () => {
    isGettingStartedClicked = true;
    crossFadeDivs('landing', 'steps', 500);
});

// show warning modal on clicking nav item
for (let i=0; i<navItems.length; i++) {
    navItems[i].addEventListener('click', () => {
        if (isGettingStartedClicked == true) {
            navItemUrl = navItems[i].getAttribute('data-url')!;
            $('#warningModal').modal('show');
        } else {
            window.location.href = navItems[i].getAttribute('data-url')!;
        }
    });
}

// actions for the warning modal
warningModalContinueBtn.addEventListener('click', () => {
    window.location.href = navItemUrl;
});
warningModalStayBtn.addEventListener('click', () => {
    $('#warningModal').modal('hide');
});

// on going from step1->step2
step1Form.addEventListener('submit', (e) => {
	e.preventDefault();
	e.stopPropagation();
	if (step1Form.checkValidity() === false) {
		step1Form.classList.add('was-validated');
		return;
	}

	// simply cross fade without server request for now
	// crossFadeDivs('step1', 'step2', 300);
	// progressBar.style.width = "66%";

	crossFadeDivs('step1', 'spinnerDiv', 300);
	(async () => {
			await delay(300);
			getDoi(zenodoToken.value, (res: resObjType) => {
					if (res.status == 0) {
							crossFadeDivs('spinnerDiv', 'step1', 100);
							fadeInDiv('stepOneError', 150);
							stepOneError.innerHTML = "";
							stepOneError.innerHTML = res.message;
					} else {
							data.doi = res.message;
							console.log("Getting data from GitHub");
							getGHData(githubURL.value, (res: resObjType) => {
									console.log(res);
									if (res.status == 0) {
											crossFadeDivs('spinnerDiv', 'step1', 100);
											fadeInDiv('stepOneError', 150);
											stepOneError.innerHTML = "";
											stepOneError.innerHTML = res.message;
									} else {
											if (res.status == 2) {
													ghUrlWarning.style.display = "block";
											} else {
													data.title = res.data?.title?.replace(/[^\x00-\x7F]/g, "");
													data.abstract = res.data?.description?.replace(/[^\x00-\x7F]/g, "");
											}

											setFormData();
											crossFadeDivs('spinnerDiv', 'step2', 100);
											progressBar.style.width = "66%";
									}
							})
					}
			});
	})();
}, false);

let setFormData = () => {
	step2FormFields.title.value = data.title || "";
	step2FormFields.doi.value = data.doi || "";
	step2FormFields.abstract.value = data.abstract || "";
	step2FormFields["date-released"].value = getDate();
};

function getDate () {
	let date = new Date();
	const offset = date.getTimezoneOffset();
	date = new Date(date.getTime() + (offset*60*1000));
	return date.toISOString().split('T')[0];
}

// on going from step2->step3
step2Form.addEventListener('submit', (e) => {
	e.preventDefault();
	e.stopPropagation();
	if (step2Form.checkValidity() === false) {
		step2Form.classList.add('was-validated');
		return;
	}
	progressBar.style.width = "100%";
	crossFadeDivs('step2', 'step3', 300);
}, false);

// on going back from step2 (step2->step1)
step2BackBtn.addEventListener('click', () => {
	crossFadeDivs('step2', 'step1', 300);
	progressBar.style.width = "33%";
	(async () => {
		await delay(400);
		step2Form.reset();
	})();
});

// on going back from step3->step2
step3BackBtn.addEventListener('click', () => {
	crossFadeDivs('step3', 'step2', 300);
	progressBar.style.width = "66%";
});