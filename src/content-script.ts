import { Instagram } from "./instagram";

const instagram = new Instagram();

const main = () => {
  instagram.fetchLikeArticle(document);
}


window.addEventListener('scroll', (_) => {
  instagram.fetchLikeArticle(document);
});

window.addEventListener('load', main, false);
