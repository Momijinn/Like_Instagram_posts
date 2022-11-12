import { Response } from "./common";

interface FetchLikeArticleResponse {
  status: Response;
  payload: number;
}

interface LaunchLikeArticlesResponse {
  status: Response;
  payload: number;
}

export class Instagram {
  private _timeoutKey: string;
  private _timeoutId: number | null;

  private _mainRoleName: string;
  private _articleRoleName: string;
  private _likeButtonElementClassName: string;

  constructor() {
    this._timeoutKey = "timeoutId";
    this._timeoutId = null;

    this._mainRoleName = "main";
    this._articleRoleName = "presentation";
    this._likeButtonElementClassName = "._aamw";
  }

  // 待機時間の取得
  private getTimeoutTime = (): Promise<number> => {
    return new Promise((resolve, _) => {
      chrome.storage.local.get(this._timeoutKey, (result) => {
        resolve(result[this._timeoutKey] || 5);
      });
    });
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

  // いいねしていない投稿を摘出
  private getNotLikeArticleElements = (
    articleElements: HTMLElement[]
  ): HTMLElement[] => {
    const response = articleElements.reduce(
      (prev: HTMLElement[], cur: HTMLElement) => {
        const likeButtonElement = cur.querySelector(
          this._likeButtonElementClassName
        )?.firstChild as HTMLElement;
        if (!likeButtonElement) {
          return prev;
        }
        return likeButtonElement.childElementCount === 2
          ? [likeButtonElement, ...prev]
          : prev;
      },
      []
    );

    return response;
  };

  private launchLikeArticles = async (
    mainElement: HTMLElement
  ): Promise<LaunchLikeArticlesResponse> => {
    // get like button
    const articleElements = this.getArticleElements(mainElement);
    const notLikeArticleElements =
      this.getNotLikeArticleElements(articleElements);

    const promise = notLikeArticleElements.map((element) => {
      return new Promise((resolve, _) => {
        element.click();
        resolve("");
      });
    });
    console.info("launch: ", promise.length);
    await Promise.all(promise);
    return {
      status: Response.SUCCESS,
      payload: promise.length,
    };
  };

  // public 表示範囲に入っている投稿に対していいねをする
  public fetchLikeArticle = async (
    document: Document
  ): Promise<FetchLikeArticleResponse> => {
    const mainElement = this.getMainElement(document);
    if (!mainElement) {
      console.error("mainElement is empty");
      return {
        status: Response.FAILED,
        payload: -1,
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
