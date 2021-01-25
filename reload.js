let currentPage = "";

const reload = async () => {
    const ts = new Date().getTime();
    const result = await fetch(`${location.href}?cd=${ts}`).then(_ => _.text());
    if (currentPage === "") {
        currentPage = result;
        setTimeout(reload, 3e3);
        return;
    }
    if (currentPage !== result) {
        location.reload();
        return;
    }
    setTimeout(reload, 618);
};

reload();
