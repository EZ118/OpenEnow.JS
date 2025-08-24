document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('#fileInput');
    const prevPageBtn = document.querySelector('#left-hand');
    const nextPageBtn = document.querySelector('#right-hand');
    const en = new ENOW();
    var page = 0;

    fileInput.addEventListener('change', async function (event) {
        const file = event.target.files[0];

        const reader = new FileReader();

        reader.onload = function (event) {
            JSZip.loadAsync(event.target.result).then(async function (zip) {
                //console.log(zip)
                en.CONFIG({
                    container: '#enow-show', // Your target div
                    zip: zip, // The loaded JSZip instance
                    // slides: 'custom/path/to/slides/', // Optional: if your slides are in a different folder
                    // resources: 'custom/path/to/resources/' // Optional
                });

                page = 0;

                await en.display(0);
            });


        };
        reader.readAsArrayBuffer(file);
    });

    prevPageBtn.onclick = function () {
        if (page > 0) {
            page -= 1;
            en.display(page);
        }
        else { return; }
    }
    nextPageBtn.onclick = function () {
        page += 1;
        en.display(page);
    }

});