import { useQuery } from "@tanstack/react-query";
import postService from "./postService";

const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => postService.getAll(),
  });
};

export default usePosts;
