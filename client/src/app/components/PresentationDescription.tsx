import { Typography } from "@mui/material";

type PresentationDescriptionProps = {
  isHost: boolean;
};

export const PresentationDescription: React.FC<
  PresentationDescriptionProps
> = ({ isHost }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ marginTop: 0 }}>
        {isHost ? "発表者へ" : "視聴者へ"}
      </Typography>
      {isHost ? (
        <ul style={{ textAlign: "left" }}>
          <li>
            このページのURLを共有すると表示されているスライドを視聴者に共有、スライド送りを視聴者の画面に同期させることができます。
          </li>
          <li>視聴者にこのページのURLを共有してください。</li>
          <li>スライド内の動画などの再生は同期されません。</li>
          <li>
            スライド外にカーソルを当てた状態でキーボードの左右の矢印キーでもスライド送りができます。
          </li>
          <li>
            「プレゼンテーション開始画面に戻る」から別なスライドを共有し直せます。
          </li>
        </ul>
      ) : (
        <ul style={{ textAlign: "left" }}>
          <li>
            発表者のスライド送りと同期されているため、発表者と同じページが表示されます。
          </li>
        </ul>
      )}
    </>
  );
};
