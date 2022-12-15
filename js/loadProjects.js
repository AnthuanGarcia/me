import { Projects } from "../assets/projects.js";
import PhotoSwipeLightbox from "../libs/photoswipe-lightbox.esm.min.js";

const pswModule = () =>
  import(
    "../libs/photoswipe.esm.min.js"
  );

const LoadProjects = () => {
  const styles = document.styleSheets[0];
  const wrapper = document.getElementsByClassName("wrapper-cont")[0];
  const controls = document.getElementsByClassName("controls")[0];
  const slidesCont = document.getElementsByClassName("cont-slides")[0];

  let rules = "";
  let rulesLines = "";

  Projects.forEach((p, i) => {
    /* Titles */
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "switch";
    input.id = `i_${i}`;
    input.classList.add("inp");

    wrapper.before(input);

    const label = document.createElement("label");
    label.classList.add("title");
    label.htmlFor = `i_${i}`;

    const spanTitle = document.createElement("span");

    const title = document.createElement("h2");
    title.innerText = p.title;
    title.classList.add("main-title");

    const lineSub = document.createElement("div");
    lineSub.classList.add("line", `line${i}`);

    title.appendChild(lineSub);
    spanTitle.appendChild(title);
    label.appendChild(spanTitle);
    controls.appendChild(label);
    // -------------------------

    const slide = document.createElement("div");
    slide.classList.add("slide");

    const content = document.createElement("div");
    content.classList.add("content", `content${i}`);

    /* Desc */
    const divDesc = document.createElement("div");
    divDesc.classList.add("title");

    const spanDesc = document.createElement("span");
    spanDesc.innerText = p.desc;

    divDesc.appendChild(spanDesc);
    content.appendChild(divDesc);
    // --------------------------

    /* Tools */
    const divTools = document.createElement("div");
    divTools.classList.add("title");

    const spanTools = document.createElement("span");
    const headTools = document.createElement("h2");
    const paraTools = document.createElement("p");

    headTools.innerText = "Herramientas";
    paraTools.textContent += p.langs.join(", ");

    spanTools.appendChild(headTools);
    spanTools.appendChild(paraTools);

    divTools.appendChild(spanTools);
    content.appendChild(divTools);
    // ---------------------------

    const divImgs = document.createElement("div");
    divImgs.id = `gallery${i}`;
    divImgs.classList.add(
      "title",
      "pswp-gallery",
      "pswp-gallery--single-column"
    );

    const spanImgs = document.createElement("span");
    const linkImgs = document.createElement("a");
    const headImgs = document.createElement("h3");

    linkImgs.href = p.imgs[0];
    linkImgs.classList.add("open-imgs");
    linkImgs.setAttribute("data-pswp-width", p.mobil ? 1000 : 1366);
    linkImgs.setAttribute("data-pswp-height", p.mobil ? 1690 : 768);
    linkImgs.target = "_blank";

    headImgs.innerText = "Ver Imagenes";

    linkImgs.appendChild(headImgs);
    spanImgs.appendChild(linkImgs);

    divImgs.appendChild(spanImgs);

    p.imgs.forEach((l, i) => {
      if (i === 0) return;

      const imgLink = document.createElement("a");

      imgLink.href = l;
      imgLink.setAttribute("data-pswp-width", p.mobil ? 1000 : 1366);
      imgLink.setAttribute("data-pswp-height", p.mobil ? 1690 : 768);
      imgLink.target = "_blank";

      divImgs.appendChild(imgLink);
    });

    content.appendChild(divImgs);

    slide.appendChild(content);
    slidesCont.appendChild(slide);

    rules += `#i_${i}:checked ~ .wrapper-cont .content${i}`;
    rulesLines += `#i_${i}:checked ~ .wrapper-cont .line${i}`;

    if (i < Projects.length - 1) {
      rules += ",";
      rulesLines += ", ";
    }

    let lightbox = new PhotoSwipeLightbox({
      gallery: `#gallery${i}`,
      children: "a",
      pswpModule: pswModule,
    });

    lightbox.init();
  });

  styles.insertRule(`${rules} { opacity: 1; pointer-events: auto; }`);
  styles.insertRule(`${rulesLines} { width: 100%; }`);
};

export { LoadProjects };
