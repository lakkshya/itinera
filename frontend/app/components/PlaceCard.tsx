const PlaceCard = () => {
  return (
    <div className="grid grid-cols-12 gap-2 text-[0.925rem] text-gray-800">
      <div className="col-span-2">
        <h3>01:00 PM - 03:00 PM</h3>
      </div>
      <div className="col-span-2">
        <h3>Place Name</h3>
      </div>
      <div className="col-span-8">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis quo non
          odio, neque minus impedit ipsum voluptate officiis aliquid, dolorum
          quisquam ex dolorem laudantium perspiciatis. Ducimus perspiciatis
          eligendi fugiat laboriosam?
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
