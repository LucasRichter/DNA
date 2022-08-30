const links = Array(8).fill(['Home', 'https://picsum.photos/250/250?grayscale', '#'])

const initLinks = () => {
    const linkTemplate = ([name, img, url], index) => {
        return `
        <li class="group" style="grid-column-start: ${index+1}; grid-row-start:${index+1};">
            <a class="flex items-center justify-center" href="${url}" data-toggle="modal" data-target="#${name}" aria-expanded="false">
                <p class="text-white pl-2 pb-2 pr-2 border-solid border-white border-b-2 font-semibold">
                    ${name} ${index}
                </p>
                <div class="flex items-center justify-center border-2 animate-pulse rounded-full group-hover:border-0 border-solid border-white w-20 h-20 transition-all" >
                    <img src="${img}" class="transition-all group-hover:w-20 group-hover:h-20 shrink-0 h-5 w-5 group-hover:animate-none rounded-full" alt="${name}" />
                </div>
            </a>
        </li>`
    }

    const header = document.getElementById('header')
    header.innerHTML = `
    <ul class="grid w-full m-40 overflow-y mx-auto">
        ${links.map(linkTemplate).join('')}
    </ul>`
}

initLinks()