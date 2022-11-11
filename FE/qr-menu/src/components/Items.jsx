import React from "react";
import { useSelector } from "react-redux";
import { selectMenu } from "../features/menuSlice";

export default function Items() {
  const menu = useSelector(selectMenu);

  return (
    <div className="items-container">
      {menu.map((item) => {
        const { id, name, cattegory, desc, price, alergens, img } = item;
        return (
          <article>
            <img src={img} alt={name} />
            <div className="title">
              <p>{name}</p>
              <p>{price}</p>
            </div>
            <p className="description">{desc}</p>
          </article>
        );
      })}
    </div>
  );
}
