let currentPage = "";

const reload = async () => {
    const result = await fetch("./").then(_ => _.text());
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
