 document.addEventListener('DOMContentLoaded', () => {
    UI.parts.include({
        src: 'header.html',
        dataId: 'header',
        callback:() => {
            UI.exe.toggle = new ToggleUI();
        }
    });
    UI.parts.include({
        src: 'footer.html',
        dataId: 'footer',
        callback:() => {
            
        }
    });

    UI.callback.nav = (v) => {
        console.log(v);
    }
});