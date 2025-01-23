import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { Slide } from "../fetch/types";
import { Dispatch, SetStateAction } from "react";

type SlidesTableProps = {
  slides: Slide[];
  setSlide: Dispatch<SetStateAction<Slide>>;
};

export const SlidesTable: React.FC<SlidesTableProps> = ({
  slides,
  setSlide,
}) => {
  return (
    <>
      <List
        sx={{
          width: "50%",
          margin: "0 auto",
          maxHeight: "50%",
          overflow: "auto",
          padding: "0",
        }}
      >
        <Typography
          sx={{
            display: "flex",
            justifyContent: "center",
            position: "sticky", // スクロールしてもタイトルが固定される
            top: 0, // 上部に固定
            backgroundColor: "#F5F5F5", // 背景を白にして、タイトルが背景に埋もれないように
            zIndex: 1, // 他の要素の上に表示されるようにする
            padding: "0px", // 少し余白を加える
          }}
          variant="h6"
          gutterBottom
        >
          過去に発表したスライド
        </Typography>
        {slides.map((slide, index) => (
          <ListItem
            key={index}
            onClick={() => setSlide(slide)}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)", // グレーの背景色
              },
            }}
          >
            <ListItemText
              primary={
                <>
                  <span style={{ fontSize: "large", marginRight: "0.8em" }}>
                    {slide.title}
                  </span>
                  <span style={{ fontSize: "small", color: "dimgray" }}>
                    {new Date(slide.createdAt).toLocaleString()}
                  </span>
                </>
              }
              secondary={slide.url}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};
