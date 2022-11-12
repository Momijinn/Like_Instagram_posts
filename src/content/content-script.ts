import { Instagram } from "./instagram";

const instagram = new Instagram();

const body = document.querySelector("body");

const main = () => {
  instagram.fetchLikeArticle(document);
};

window.addEventListener("scroll", (_) => {
  instagram.fetchLikeArticle(document);
});

window.addEventListener("load", main, false);
