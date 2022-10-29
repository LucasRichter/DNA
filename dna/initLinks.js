const links = [1950, 1970, 1990, 2000, 2012, 2015, 2017, 2021];

const initLinks = () => {
  const linkTemplate = (year, index) => `
        <li class="group list-none opacity-0 pointer-events-none transition-opacity " key="${index}">
            <a class="flex items-center justify-center hover:scale-110 hover:text-[#00a0d5] hover:border-[#00a0d5] rounded-full transition-all w-[72px] h-[72px] bg-black border-4 border-white text-white" href="${year}" data-target="#${year}"> 
                - ${year} -
            </a>
        </li>`;

  const header = document.getElementById('header');
  header.innerHTML = links.map(linkTemplate).join('\n');
  return header;
};

initLinks();
