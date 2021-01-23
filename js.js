const pageContent = document.querySelector("#page-content");
document.body.appendChild(document.importNode(pageContent.content, true));

const url = "https://script.google.com/macros/s/AKfycbwodl2pprNYh1ICApuq6LSux5ExC62RchbDU5jB2AnqkMhCJJSH/exec";

const post = async (body) => fetch(url, {
    method: 'post',
    redirect: 'follow',
    body: JSON.stringify(body)
})
    .then(r => r.json().then(_ => ({
        status: true,
        type: "json",
        data: _
    })).catch(_ => r.text().then(_ => ({
        status: true,
        type: "other",
        data: _
    }))))
    .catch(_e => ({
        status: false,
        type: "error",
        data: _e
    }));
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const rnds = (n) => toHexString(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);
const validMail = (mail) => /^[\w\.\-\_]+\@[\w\-\_]+\.[\w\-\_]+$/.test(mail);


const btnContactMe = document.querySelector(".first #action button");
const contactFormContainer = document.querySelector("#contact");

btnContactMe.addEventListener("click", () => {
    window.scroll({
        top: contactFormContainer.offsetTop,
        behavior: "smooth",
        left: 0
    });
});



const sendAnalytics = async (id) => {
    const realSize = getRealSize();
    post({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        product: navigator.product,
        sub: navigator.productSub,
        languaje: navigator.language,
        referrer: document.referrer,
        realWidth: realSize.width,
        realHeight: realSize.height,
        scrWidth: screen.width,
        srcHeight: screen.height,
        srcAWidth: screen.availWidth,
        srcAHeight: screen.availHeight,
        href: location.href,
        visitID: id,
        type: "visit"
    }).then(_ => _).catch(_ => _);
};

const visitID = (() => {
    let id = localStorage.getItem("mp_vst_uid");
    if (id) return id;
    id = rnds(64);
    localStorage.setItem("mp_vst_uid", id);
    return id;
})();

sendAnalytics(visitID);

const showMessage = (msgStr, timeout = 2e3) => {
    const msgs = document.querySelector("#msgs");
    const msg = document.createElement("div");
    msg.classList.add("msg");
    msg.innerHTML = msgStr;
    msgs.appendChild(msg);
    setTimeout(() => {
        msgs.removeChild(msg);
    }, timeout);
};

const form = contactFormContainer.querySelector("div#contact-form");

const nameEl = contactFormContainer.querySelector("input[type=text]");
const emailEl = contactFormContainer.querySelector("input[type=email]");
const queryEl = contactFormContainer.querySelector("textarea");
const sendBtn = contactFormContainer.querySelector("button");

const sending = contactFormContainer.querySelector("#sending");
const thanks = contactFormContainer.querySelector("#thanks");

contactFormContainer.removeChild(sending);
contactFormContainer.removeChild(thanks);

const fsize = form.getClientRects()[0];

sending.style.height = fsize.height + "px";
thanks.style.height = fsize.height + "px";

const sendData = async () => {
    const body = {
        name: nameEl.value,
        email: emailEl.value,
        query: queryEl.value,
        visitID,
        type: "contact"
    };

    let allOk = true;
    if (!body.name.trim()) {
        showMessage("Please write your name to continue.");
        allOk = false;
    }
    if (!validMail(body.email)) {
        showMessage("Invalid email.");
        allOk = false;
    }
    if (!body.query.trim()) {
        showMessage("Please write your query to continue.");
        allOk = false;
    }
    if (!allOk) return;

    contactFormContainer.removeChild(form);
    contactFormContainer.appendChild(sending);

    const ok = await post(body)
        .catch(_ => false);

    if (!ok) {
        showMessage("An error occurred while sending the information. Please, try again.");
        contactFormContainer.removeChild(sending);
        contactFormContainer.appendChild(form);
        return;
    }
    contactFormContainer.removeChild(sending);
    contactFormContainer.appendChild(thanks);
};

sendBtn.addEventListener("click", sendData);
nameEl.addEventListener("keyup", e => {
    if (e.key !== "Enter") return;
    sendData();
});
emailEl.addEventListener("keyup", e => {
    if (e.key !== "Enter") return;
    sendData();
});



