const links = Array(8).fill(['Home', 'https://picsum.photos/250/250?grayscale', '#']);

const initLinks = () => {
  const linkTemplate = ([name, img, url], index) => `
        <li class="group list-none" style="z-index: 100 !important;" key="${index}">
            <a class="group-hover:opacity-100 animate-bounce relative transition-all opacity-0 flex items-center justify-center" href="${url}" data-toggle="modal" data-target="#${name}" aria-expanded="false">
                <div class="absolute">
                    <p class="text-white pl-2 pb-2 pr-2 border-solid border-white border-b-2 font-semibold">
                        ${name} ${index}
                    </p>
                </div>
                <div class="flex items-center justify-center border-2 rounded-full group-hover:border-0 border-solid border-white w-20 h-20 transition-all" >
                    <img src="${img}" class="transition-all group-hover:w-20 group-hover:h-20 shrink-0 h-5 w-5 rounded-full" alt="${name}" />
                </div>
            </a>
        </li>`;

  const header = document.getElementById('header');
  header.innerHTML = links.map(linkTemplate).join('\n');
  return header;
};

initLinks();
