import { Response } from "./common";
import { Instagram } from "./instagram";
import { Snack } from "./snack/snack";

const instagram = new Instagram();
const snack = new Snack();

const body = document.querySelector("body");

const main = () => {
  body?.appendChild(snack.getElement());
};

window.addEventListener("scroll", (_) => {
  instagram.fetchLikeArticle(document).then((e) => {
    // todo fix
    if (e.status === Response.SUCCESS && e.payload >= 1) {
      snack.show(`${e.payload}投稿をいいねしました`, e.status);
    }
  });
});

window.addEventListener("load", main, false);
