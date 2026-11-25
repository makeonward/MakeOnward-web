import React from "react";
import { serviceMockup } from "./data";

// The picture of a service.
const ServicePhoto = ({ service, sizes }) => {
  const picture = serviceMockup(service.visual);
  return (
    <img
      src={picture.src}
      srcSet={picture.srcSet}
      sizes={sizes}
      alt=""
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  );
};

export default ServicePhoto;
