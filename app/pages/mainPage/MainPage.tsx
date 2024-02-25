"use client";

import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import type { TProfileByKeycloakId } from "@/app/api/profile/byKeycloakId";
import type { TProfileList } from "@/app/api/profile/list";
import { SearchForm } from "@/app/entities/search/searchForm";
import { ELanguage, ERoutes } from "@/app/shared/enums";
import { useProxyUrl } from "@/app/shared/hooks";
import { createPath } from "@/app/shared/utils";
import "./MainPage.scss";

type TProps = {
  lng: ELanguage;
  profile?: TProfileByKeycloakId;
  profileList?: TProfileList;
};

export const MainPage: FC<TProps> = ({ lng, profile, profileList }) => {
  const { proxyUrl } = useProxyUrl();

  return (
    <div className="MainPage">
      <SearchForm lng={lng} profile={profile} />
      <div className="MainPage-List">
        {(profileList?.content ?? []).map((item) => (
          <Link
            href={createPath({
              route: ERoutes.Profile,
              params: { id: item.id },
            })}
            key={item.id}
          >
            <div className="MainPage-WrapperImage" key={item.id}>
              <Image
                alt=""
                className="MainPage-Image"
                fill={true}
                priority={true}
                sizes="100vw"
                src={`${proxyUrl}${item.image.url}`}
                quality={100}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
