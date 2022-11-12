import style from "./style.scss";
import { Response } from "../common";

export class Snack {
  private snackBarElement: HTMLDivElement;

  constructor() {
    this.snackBarElement = this.createSnackElement();
  }

  private createSnackElement = (): HTMLDivElement => {
    const element = document.createElement("div");
    element.className = style.snack;

    return element;
  };

  public show = (text: string, status: Response): void => {
    this.snackBarElement.textContent = text;

    if (status === Response.SUCCESS) {
      this.snackBarElement.classList.add(...[style.show, style.success]);
    }

    window.setTimeout(() => {
      this.snackBarElement.className = style.snack;
    }, 2800);
  };

  public getElement = (): HTMLDivElement => {
    return this.snackBarElement;
  };
}
