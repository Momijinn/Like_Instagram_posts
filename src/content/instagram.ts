import { Response } from "./common";
export class Instagram {
  private _timeoutKey: string;
  private _timeoutId: number | null;

  private _mainRoleName: string;
  private _articleRoleName: string;
  private _likeButtonElementClassName: string;
  private _articleImageElementClassName: string;
  private _articleContributorClassName: string;

  constructor() {
    this._timeoutKey = "timeoutId";
    this._timeoutId = null;

    this._mainRoleName = "main";
    this._articleRoleName = "presentation";
    this._likeButtonElementClassName = "._aamw";
    this._articleImageElementClassName = "._aatk";
    this._articleContributorClassName =
      ".x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz._acan._acao._acat._acaw._a6hd";
  }

  // 待機時間の取得
  private getTimeoutTime = (): Promise<number> => {
    return new Promise((resolve, _) => {
      chrome.storage.local.get(this._timeoutKey, (result) => {
        resolve(result[this._timeoutKey] || 5);
      });
    });
  };

  // 画面領域
  private getWindowRect = (): { top: number; bottom: number } => {
    return {
      top: 0,
      bottom: window.innerHeight,
    };
  };

  // 投稿領域の取得
  private getElementRect = (
    element: HTMLElement
  ): { top: number; bottom: number } => {
    const position = element.getBoundingClientRect();

    return {
      top: position.top,
      bottom: position.bottom,
    };
  };

  // 対象 dom のロード完了
  private getMainElement = (document: Document): HTMLElement | null => {
    const mainElement = document.querySelector(
      `main[role=${this._mainRoleName}]`
    ) as HTMLElement | null;
    return mainElement;
  };

  // 投稿を取得
  private getArticleElements = (element: HTMLElement): HTMLElement[] => {
    const articleElements = (Array.from(
      element.querySelectorAll(`article[role="${this._articleRoleName}"]`)
    ) || []) as HTMLElement[];
    return articleElements;
  };

  // window 領域内になる投稿を取得
  // 基準は投稿写真が window 領域内にあるかどうか
  private getArticleElementsInTheScreen = (
    articleElements: HTMLElement[]
  ): HTMLElement[] => {
    const windowRect = this.getWindowRect();

    const response = articleElements.reduce(
      (prev: HTMLElement[], cur: HTMLElement) => {
        const articleImageElement = cur.querySelector(
          this._articleImageElementClassName
        ) as HTMLElement | null;
        if (!articleImageElement) {
          return prev;
        }

        const elementRect = this.getElementRect(articleImageElement);
        return windowRect.top <= elementRect.top &&
          windowRect.bottom >= elementRect.bottom
          ? [...prev, cur]
          : prev;
      },
      []
    );

    return response;
  };

  private getLikeButtonElement = (element: HTMLElement): HTMLElement | null => {
    const response = element.querySelector(this._likeButtonElementClassName)
      ?.firstChild as HTMLElement | null;
    return response;
  };

  // いいねしていない投稿のボタン
  private getNotLikeArticleElements = (
    articleElements: HTMLElement[]
  ): HTMLElement[] => {
    const response = articleElements.reduce(
      (prev: HTMLElement[], cur: HTMLElement) => {
        const likeButtonElement = this.getLikeButtonElement(cur);
        if (!likeButtonElement) {
          return prev;
        }
        return likeButtonElement.childElementCount === 2
          ? [cur, ...prev]
          : prev;
      },
      []
    );
    return response;
  };

  // 投稿者名の取得
  private getArticleContributor = (element: HTMLElement): string => {
    const response = element.querySelector(this._articleContributorClassName);

    if (!response) return "";
    return response.textContent ?? "";
  };

  private launchLikeArticles = async (
    mainElement: HTMLElement
  ): Promise<{
    status: Response;
    payload: string;
  }> => {
    // get article element
    const articleElements = this.getArticleElements(mainElement);
    const articleElementsInTheScreen =
      this.getArticleElementsInTheScreen(articleElements);

    // get like button
    const notLikeArticleButtonElements = this.getNotLikeArticleElements(
      articleElementsInTheScreen
    );

    const promise = notLikeArticleButtonElements.map(
      (element): Promise<string> => {
        return new Promise((resolve, _) => {
          const clickElement = this.getLikeButtonElement(element);
          console.log("clickElement: ", clickElement);
          clickElement?.click();

          const contributor = this.getArticleContributor(element);
          console.log("contributor: ", contributor);

          resolve(contributor);
        });
      }
    );
    console.info("launch: ", promise.length);
    const response = await Promise.all(promise);
    return {
      status: Response.SUCCESS,
      payload: response.join(","),
    };
  };

  // public 表示範囲に入っている投稿に対していいねをする
  public fetchLikeArticle = async (
    document: Document
  ): Promise<{
    status: Response;
    payload: string;
  }> => {
    const mainElement = this.getMainElement(document);
    if (!mainElement) {
      console.error("mainElement is empty");
      return {
        status: Response.FAILED,
        payload: "",
      };
    }

    // いいねをする時間の取得
    const timeoutTime = await this.getTimeoutTime();

    // いいねをする
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
    }

    return new Promise((resolve, _) => {
      this._timeoutId = window.setTimeout(async () => {
        const response = await this.launchLikeArticles(mainElement);
        console.info("launchLikeArticles response: ", response);

        resolve({
          status: Response.SUCCESS,
          payload: response.payload,
        });
      }, timeoutTime * 1000);
    });
  };
}
