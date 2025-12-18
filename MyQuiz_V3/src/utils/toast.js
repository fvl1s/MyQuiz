export const Toast = {
    show: (message) => {
        const x = document.getElementById("toast");
        x.className = "show";
        x.innerText = message;
        setTimeout(() => { 
            x.className = ""; 
        }, 3000);
    }
};