import 'bootstrap';
import * as jQuery from "jquery";
import { getDoi, getGHData } from './apiReq';
import { resObjType } from './config';
const delay = require('delay');
let $: any = jQuery;

/** Variables */
const getStartedBtnDiv = document.getElementById('get-started-btn')!;
const navItems = document.getElementsByClassName('nav-link')!;
const warningModalContinueBtn = document.getElementById('warningModalContinueBtn')!;
const warningModalStayBtn = document.getElementById('warningModalStayBtn')!;
const stepOneSubmitBtn = document.getElementById('stepOneSubmitBtn')!;
const zenodoToken = <HTMLInputElement>document.getElementById('zenodoToken')!;
const githubURL = <HTMLInputElement>document.getElementById('githubURL')!;
const stepOneError = document.getElementById('stepOneError')!;
const spinnerDiv = document.getElementById('spinnerDiv')!;
const ghUrlWarning = document.getElementById('ghUrlWarning')!;
let isGettingStartedClicked = false;
let navItemUrl: string;
let data: {
    doi?: string,
    date?: string,
    version?: string,
    title?: string,
    description?: string
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
stepOneSubmitBtn.addEventListener('click', () => {
    crossFadeDivs('step1', 'spinnerDiv', 300, () => spinnerDiv.style.display="flex");
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
                            ghUrlWarning.classList.remove('hide');
                            ghUrlWarning.classList.add('show');
                        } else {
                            data.title = res.data?.title;
                            data.description = res.data?.description;
                        }

                        crossFadeDivs('spinnerDiv', 'step2', 100);
                    }
                })
            }
        });
    })();
});