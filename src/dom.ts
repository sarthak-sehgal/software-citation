import 'bootstrap';
import * as jQuery from "jquery";
let $: any = jQuery;

/** Variables */
const getStartedBtnDiv = document.getElementById('get-started-btn')!;
const navItems = document.getElementsByClassName('nav-link')!;
const warningModalContinueBtn = document.getElementById('warningModalContinueBtn')!;
const warningModalStayBtn = document.getElementById('warningModalStayBtn')!;
let isGettingStartedClicked = false;
let navItemUrl: string;

/** Utility Functions */
function fadeOutDiv (id: string, dur: number) {
    $('#'+id).fadeOut(dur);
}

function fadeInDiv (id: string, dur: number) {
    $('#'+id).fadeIn(dur);
}

function crossFadeDivs (idOut: string, idIn: string, dur: number) {
    fadeOutDiv(idOut, dur/2);
    setTimeout(() => fadeInDiv(idIn, dur/2), 0.8*dur);
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
})